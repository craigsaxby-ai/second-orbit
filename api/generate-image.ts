import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''

const CHANNEL_STYLE: Record<string, string> = {
  CL: 'executive thought leadership — authoritative, professional, deep navy background (#0f172a), strong bold typography, minimal geometric accent',
  SL: 'modern B2B SaaS — clean, data-driven, dark background with subtle orange accent (#f97316), professional',
  CP: 'community engagement — conversational, approachable, clean dark background, warm tone',
}

function buildPrompt(topic: string, hook: string, channel: string): string {
  const style = CHANNEL_STYLE[channel] ?? CHANNEL_STYLE.CL
  return [
    `LinkedIn post image. Style: ${style}.`,
    `Feature this hook as the dominant text element: "${hook}"`,
    `Topic: "${topic}"`,
    `Rules: dark navy/near-black background, bold clean sans-serif typography, hook text is the hero element, minimal graphic accent only (thin line or subtle gradient), 16:9 landscape format, no human faces, no logos, no stock photos, professional and polished, text must be large and legible.`,
  ].join(' ')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { postId, topic, hook, channel } = req.body as {
    postId: string
    topic: string
    hook: string
    channel: string
  }

  if (!postId || !topic || !hook) {
    return res.status(400).json({ error: 'postId, topic, and hook are required' })
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  // ── Step 1: Generate image via OpenAI DALL-E 3 ───────────────────────────
  let imageUrl: string
  try {
    const prompt = buildPrompt(topic, hook, channel ?? 'CL')
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        response_format: 'url',
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}))
      return res.status(502).json({ error: 'Image generation failed', detail: err })
    }

    const openaiData = await openaiRes.json() as { data: { url: string }[] }
    const generatedUrl = openaiData.data?.[0]?.url
    if (!generatedUrl) {
      return res.status(502).json({ error: 'No image URL returned from OpenAI' })
    }
    imageUrl = generatedUrl
  } catch (err) {
    return res.status(502).json({ error: 'Image generation failed', detail: String(err) })
  }

  // ── Step 2: Fetch image and upload to Supabase storage ───────────────────
  const filename = `radar-${postId.slice(0, 8)}.png`

  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch generated image' })
    }
    const imageBuffer = Buffer.from(await imgRes.arrayBuffer())

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/radar-images/${filename}`
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
        'x-upsert': 'true',
      },
      body: imageBuffer,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}))
      return res.status(502).json({ error: 'Supabase upload failed', detail: err })
    }
  } catch (err) {
    return res.status(502).json({ error: 'Upload failed', detail: String(err) })
  }

  const storedUrl = `${SUPABASE_URL}/storage/v1/object/public/radar-images/${filename}`

  // ── Step 3: Update radar_posts record ────────────────────────────────────
  try {
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/radar_posts?id=eq.${postId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          image_url: storedUrl,
          generate_image_requested: false,
          updated_at: new Date().toISOString(),
        }),
      }
    )
    if (!patchRes.ok) {
      console.warn('DB update failed for', postId)
    }
  } catch {
    console.warn('DB update threw for', postId)
  }

  return res.status(200).json({ imageUrl: storedUrl })
}
