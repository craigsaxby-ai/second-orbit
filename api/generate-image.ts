import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''

const CHANNEL_STYLE: Record<string, string> = {
  CL: 'executive thought leadership — authoritative, professional, deep navy background, strong typography',
  SL: 'modern B2B SaaS brand — clean, data-driven, dark with a subtle orange accent',
  CP: 'community engagement — conversational, approachable, clean dark background',
}

function buildPrompt(topic: string, hook: string, channel: string): string {
  const style = CHANNEL_STYLE[channel] ?? CHANNEL_STYLE.CL
  return [
    `Create a LinkedIn post image in a ${style} visual style.`,
    `The image should feature this hook line as the main typographic element: "${hook}"`,
    `Topic context: "${topic}"`,
    `Design rules:`,
    `- Dark navy or near-black background (#0f172a or similar)`,
    `- Bold, clean sans-serif typography — the hook is the hero`,
    `- Minimal graphic accent (subtle geometric shape, gradient, or thin line element only)`,
    `- 16:9 aspect ratio, suitable for LinkedIn post attachment`,
    `- No human faces, no logos, no stock imagery`,
    `- Professional and polished — no clipart, no busy layouts`,
    `- Text should be large and legible at small sizes`,
  ].join('\n')
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

  // ── Step 1: Generate image via OpenAI ────────────────────────────────────
  let imageBase64: string
  try {
    const prompt = buildPrompt(topic, hook, channel ?? 'CL')
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1536x1024',
        quality: 'medium',
        output_format: 'png',
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}))
      return res.status(502).json({ error: 'OpenAI error', detail: err })
    }

    const openaiData = await openaiRes.json() as { data: { b64_json: string }[] }
    imageBase64 = openaiData.data[0].b64_json
  } catch (err) {
    return res.status(502).json({ error: 'Image generation failed', detail: String(err) })
  }

  // ── Step 2: Upload to Supabase storage ───────────────────────────────────
  const filename = `radar-${postId.slice(0, 8)}.png`
  const imageBuffer = Buffer.from(imageBase64, 'base64')

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/radar-images/${filename}`
  try {
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

  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/radar-images/${filename}`

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
          image_url: imageUrl,
          generate_image_requested: false,
          updated_at: new Date().toISOString(),
        }),
      }
    )
    if (!patchRes.ok) {
      // Image is generated and uploaded — just warn, don't fail
      console.warn('DB update failed for', postId)
    }
  } catch {
    console.warn('DB update threw for', postId)
  }

  return res.status(200).json({ imageUrl })
}
