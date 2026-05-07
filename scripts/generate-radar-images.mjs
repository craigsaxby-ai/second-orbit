/**
 * Radar Image Generator
 * Generates images for all radar_posts where image_url IS NULL.
 * Uploads to Supabase Storage bucket 'radar-images' and updates the record.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... GOOGLE_API_KEY=... node scripts/generate-radar-images.mjs
 *
 * Optional: only generate for a specific channel
 *   CHANNEL=CL OPENAI_API_KEY=sk-... node scripts/generate-radar-images.mjs
 *
 * Optional: generate for a single post by ID
 *   POST_ID=<uuid> OPENAI_API_KEY=sk-... node scripts/generate-radar-images.mjs
 *
 * Channel routing:
 *   CL → OpenAI gpt-image-1, 16:9, quality: high
 *   SL → Google Gemini flash image preview, 16:9, with Searchline logo reference
 *   CP → OpenAI gpt-image-1, SL-style prompt without logo
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://xwcmvemayjjcfyjhdkii.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_KEY) {
  console.error('❌  SUPABASE_KEY or VITE_SUPABASE_ANON_KEY is not set.')
  process.exit(1)
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'radar-images'

// Searchline logo reference image path
const SEARCHLINE_LOGO_PATH = '/Users/craigsaxby_openclaw/.openclaw/workspace/searchline-logo.jpg'

// ─── Scene rotation for CL posts ──────────────────────────────────────────────

function getCLScene(topic) {
  const t = (topic ?? '').toLowerCase()
  if (t.includes('interview') || t.includes('prep') || t.includes('question'))
    return 'two professionals facing each other across a boardroom table, city skyline through floor-to-ceiling windows'
  if (t.includes('linkedin') || t.includes('visibility') || t.includes('profile') || t.includes('brand') || t.includes('content'))
    return 'single suited professional at desk, city view, reviewing profile on screen'
  if (t.includes('passive') || t.includes('headhunt') || t.includes('sourc') || t.includes('candidate'))
    return 'single professional on phone call scanning a document'
  if (t.includes('hiring') || t.includes('process') || t.includes('recruit') || t.includes('talent'))
    return 'two executives leaning over a table reviewing papers collaboratively'
  return 'confident executive walking through glass office entrance'
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildCLPrompt(topic, hook) {
  const scene = getCLScene(topic)
  const hookText = (hook ?? topic ?? 'Executive insights').slice(0, 120)
  return `Professional LinkedIn post image for an executive search practitioner. Dark navy background. Premium flat vector illustration: ${scene}. Senior, intelligent, credible atmosphere. Clean bold white sans-serif text: "${hookText}". Very subtle tech accent lines, minimal. Premium consulting or fintech brand illustration aesthetic. No cartoons. Landscape 16:9.`
}

function buildSLPrompt(topic, hook) {
  const hookText = (hook ?? topic ?? 'Searchline').slice(0, 120)
  return `LinkedIn post image for Searchline brand. Plain flat dark navy background (#020617), completely clean, no patterns, no textures. Left side: bold white sans-serif headline text, no underline: "${hookText}". Bottom right: the Searchline logo mark — a glowing orange circle ring containing 5 vertical rounded bars (waveform/equalizer) of varying heights, tallest in centre, with warm orange glow. Small "Searchline" wordmark beneath the icon in white. Minimal, premium, clean. Landscape 16:9.`
}

function buildCPPrompt(topic, hook) {
  // Same visual style as SL but without Searchline branding
  const hookText = (hook ?? topic ?? 'Professional insights').slice(0, 120)
  return `LinkedIn post image. Plain flat dark navy background (#020617), completely clean, no patterns, no textures. Left side: bold white sans-serif headline text, no underline: "${hookText}". Minimal, premium, clean, no logo, no branding marks. Landscape 16:9.`
}

function buildPrompt(channel, topic, hook) {
  switch (channel) {
    case 'CL': return buildCLPrompt(topic, hook)
    case 'SL': return buildSLPrompt(topic, hook)
    case 'CP': return buildCPPrompt(topic, hook)
    default:   return buildSLPrompt(topic, hook)
  }
}

// ─── OpenAI image generation (CL, CP) ────────────────────────────────────────

async function generateImageOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Export it and try again.')
  }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',   // 16:9 landscape (closest supported by gpt-image-1)
      quality: 'high',
      output_format: 'png',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    // Fallback: try dall-e-3 if gpt-image-1 is not available
    if (res.status === 404 || err.includes('does not exist')) {
      return generateImageOpenAIFallback(prompt)
    }
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }

  const json = await res.json()
  // gpt-image-1 returns b64_json
  if (json.data?.[0]?.b64_json) return { b64: json.data[0].b64_json, ext: 'png' }
  // Some versions return url
  if (json.data?.[0]?.url) return { url: json.data[0].url, ext: 'png' }
  throw new Error('Unexpected OpenAI response format')
}

async function generateImageOpenAIFallback(prompt) {
  console.log('    (falling back to dall-e-3…) ')
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
      size: '1792x1024',
      quality: 'hd',
      response_format: 'b64_json',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI dall-e-3 error ${res.status}: ${err}`)
  }

  const json = await res.json()
  return { b64: json.data[0].b64_json, ext: 'png' }
}

// ─── Google Gemini image generation (SL) ─────────────────────────────────────

async function generateImageGoogle(prompt, useLogoRef = false) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set. Export it and try again (needed for SL posts).')
  }

  const model = 'gemini-2.0-flash-preview-image-generation'

  // Build parts — text prompt + optional image reference
  const parts = [{ text: prompt }]

  if (useLogoRef) {
    try {
      const logoBuffer = readFileSync(SEARCHLINE_LOGO_PATH)
      const logoB64 = logoBuffer.toString('base64')
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: logoB64,
        },
      })
    } catch (e) {
      console.warn(`    ⚠️  Could not load logo reference: ${e.message} — continuing without it`)
    }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Gemini error ${res.status}: ${err}`)
  }

  const json = await res.json()

  // Extract image from response
  const candidates = json.candidates ?? []
  for (const candidate of candidates) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const mimeType = part.inlineData.mimeType
        const ext = mimeType.includes('jpeg') ? 'jpg' : 'png'
        return { b64: part.inlineData.data, ext }
      }
    }
  }

  throw new Error('No image found in Google Gemini response')
}

// ─── Route generation by channel ─────────────────────────────────────────────

async function generateImage(channel, prompt) {
  switch (channel) {
    case 'SL':
      return generateImageGoogle(prompt, true)   // with Searchline logo reference
    case 'CP':
      return generateImageOpenAI(prompt)         // SL-style prompt, no logo, OpenAI
    case 'CL':
    default:
      return generateImageOpenAI(prompt)         // CL uses OpenAI gpt-image-1
  }
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

// ─── Upload to Supabase Storage ───────────────────────────────────────────────

async function uploadImage(postId, result) {
  const { b64, url: imageUrl, ext = 'png' } = result
  const path = `posts/${postId}.${ext}`

  let buffer
  if (b64) {
    buffer = Buffer.from(b64, 'base64')
  } else if (imageUrl) {
    // Fetch the URL if we got a URL instead of b64
    const r = await fetch(imageUrl)
    const ab = await r.arrayBuffer()
    buffer = Buffer.from(ab)
  } else {
    throw new Error('No image data to upload')
  }

  const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: true })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('📡  Radar Image Generator starting…\n')
  await ensureBucket()

  const channelFilter = process.env.CHANNEL
  const postIdFilter = process.env.POST_ID

  let query = supabase
    .from('radar_posts')
    .select('id, channel, topic, hook')

  if (postIdFilter) {
    query = query.eq('id', postIdFilter)
    console.log(`🔍  Generating for single post: ${postIdFilter}`)
  } else {
    query = query.is('image_url', null)
    if (channelFilter) {
      query = query.eq('channel', channelFilter)
      console.log(`🔍  Filtering to channel: ${channelFilter}`)
    }
  }

  const { data: posts, error } = await query
  if (error) { console.error('Supabase fetch error:', error.message); process.exit(1) }

  console.log(`📋  Found ${posts.length} post(s) to generate\n`)

  for (const post of posts) {
    const label = `[${post.channel}] ${(post.topic ?? '').slice(0, 60)}`
    try {
      process.stdout.write(`  🎨  Generating: ${label}… `)
      const prompt = buildPrompt(post.channel, post.topic, post.hook)
      const result = await generateImage(post.channel, prompt)

      process.stdout.write('uploading… ')
      const publicUrl = await uploadImage(post.id, result)

      const { error: updateError } = await supabase
        .from('radar_posts')
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', post.id)

      if (updateError) throw new Error(updateError.message)

      console.log(`✅  done → ${publicUrl}`)

      // Respect rate limits between posts (not after the last one)
      if (posts.indexOf(post) < posts.length - 1) {
        await new Promise((r) => setTimeout(r, 8000))
      }
    } catch (err) {
      console.log(`❌  failed: ${err.message}`)
    }
  }

  console.log('\n✅  Image generation complete.')
}

run()
