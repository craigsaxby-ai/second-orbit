import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim()
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SERVICE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing service key' })
  }

  try {
    const { articleId, fileName, contentType, fileBase64 } = req.body as {
      articleId: string
      fileName: string
      contentType: string
      fileBase64: string
    }

    if (!articleId || !fileName || !contentType || !fileBase64) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const ext = fileName.split('.').pop() ?? 'jpg'
    const path = `${articleId}/cover.${ext}`
    const fileBuffer = Buffer.from(fileBase64, 'base64')

    // Upload to Supabase Storage using service role key
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/article-images/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: fileBuffer,
      }
    )

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      return res.status(500).json({ error: `Upload failed: ${err}` })
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/article-images/${path}`
    return res.status(200).json({ url: publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: message })
  }
}
