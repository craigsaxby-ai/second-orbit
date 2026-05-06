/**
 * Radar Image Generator
 * Generates images for all radar_posts where image_url IS NULL.
 * Uploads to Supabase Storage bucket 'radar-images' and updates the record.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-radar-images.mjs
 *
 * Optional: only generate for a specific channel
 *   CHANNEL=CL OPENAI_API_KEY=sk-... node scripts/generate-radar-images.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xwcmvemayjjcfyjhdkii.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_KEY) {
  console.error('❌  SUPABASE_KEY or VITE_SUPABASE_ANON_KEY is not set.')
  process.exit(1)
}
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('❌  OPENAI_API_KEY is not set. Export it and try again.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'radar-images'

// ─── Style map per channel ────────────────────────────────────────────────────

const CHANNEL_PROMPTS = {
  CL: (topic, hook) =>
    `A clean, professional editorial photograph or abstract visual for a LinkedIn post by a senior executive. Theme: "${topic}". Mood: authoritative, intelligent, understated. Colour palette: deep navy blue, white, subtle gold accents. No text, no words, no letters overlaid. Cinematic, high quality, square format.`,
  SL: (topic, hook) =>
    `A modern, professional visual representing hiring and recruitment intelligence. Theme: "${topic}". Mood: innovative, trustworthy, data-driven. Colour palette: clean white and orange accents with dark backgrounds. No text, no words. Abstract or conceptual imagery — people, connections, data flows. Square format, high quality.`,
  CP: (topic, hook) =>
    `A friendly, engaging social media visual representing community conversation and professional networking. Theme: "${topic}". Mood: approachable, curious, human. Colour palette: warm greens and whites, natural light feel. No text, no words overlaid. Square format, high quality.`,
}

function buildPrompt(channel, topic, hook) {
  const fn = CHANNEL_PROMPTS[channel] ?? CHANNEL_PROMPTS.SL
  return fn(topic ?? 'professional insights', hook ?? '')
}

// ─── Ensure bucket exists ─────────────────────────────────────────────────────

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = (buckets ?? []).some((b) => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) throw new Error(`Failed to create bucket: ${error.message}`)
    console.log(`✅  Created storage bucket: ${BUCKET}`)
  }
}

// ─── Generate image via OpenAI ────────────────────────────────────────────────

async function generateImage(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }

  const json = await res.json()
  return json.data[0].b64_json // base64 PNG
}

// ─── Upload to Supabase Storage ───────────────────────────────────────────────

async function uploadImage(postId, b64) {
  const buffer = Buffer.from(b64, 'base64')
  const path = `posts/${postId}.png`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/png', upsert: true })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('📡  Radar Image Generator starting…\n')
  await ensureBucket()

  const channelFilter = process.env.CHANNEL

  let query = supabase
    .from('radar_posts')
    .select('id, channel, topic, hook')
    .is('image_url', null)

  if (channelFilter) {
    query = query.eq('channel', channelFilter)
    console.log(`🔍  Filtering to channel: ${channelFilter}`)
  }

  const { data: posts, error } = await query
  if (error) { console.error('Supabase fetch error:', error.message); process.exit(1) }

  console.log(`📋  Found ${posts.length} posts without images\n`)

  for (const post of posts) {
    const label = `[${post.channel}] ${(post.topic ?? '').slice(0, 60)}`
    try {
      process.stdout.write(`  🎨  Generating: ${label}… `)
      const prompt = buildPrompt(post.channel, post.topic, post.hook)
      const b64 = await generateImage(prompt)

      process.stdout.write('uploading… ')
      const publicUrl = await uploadImage(post.id, b64)

      const { error: updateError } = await supabase
        .from('radar_posts')
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', post.id)

      if (updateError) throw new Error(updateError.message)

      console.log(`✅  done`)

      // Respect OpenAI rate limits — 1 image every ~12s on standard tier
      if (posts.indexOf(post) < posts.length - 1) {
        await new Promise((r) => setTimeout(r, 13000))
      }
    } catch (err) {
      console.log(`❌  failed: ${err.message}`)
    }
  }

  console.log('\n✅  Image generation complete.')
}

run()
