import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = 'drafted' | 'approved' | 'scheduled' | 'posted'

interface RadarMetric {
  id: string
  week_of: string
  channel: string
  post_impressions: number
  followers: number
  profile_viewers: number
  search_appearances: number
  posts_published: number
  comments_received: number
  likes_received: number
  best_post: string | null
  notes: string | null
  created_at: string
}

interface RadarAsset {
  id: string
  name: string
  asset_type: string
  content: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

interface RadarPost {
  id: string
  date: string | null
  channel: string | null
  format: string | null
  topic: string | null
  hook: string | null
  draft_text: string | null
  risk_status: string | null
  risk_notes: string | null
  status: PostStatus
  image_url: string | null
  created_at: string
  updated_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CHANNEL_STYLES: Record<string, { label: string; color: string; bg: string; border: string; placeholder: string }> = {
  CL:  { label: 'Craig LinkedIn',  color: '#fff', bg: '#3b82f6', border: '#2563eb', placeholder: '#1d4ed8' },
  SL:  { label: 'Searchline Page', color: '#fff', bg: '#f97316', border: '#ea580c', placeholder: '#c2410c' },
  CP:  { label: 'Comment Prompt',  color: '#fff', bg: '#22c55e', border: '#16a34a', placeholder: '#15803d' },
}

const RISK_DOT: Record<string, string> = {
  green:  '🟢',
  yellow: '🟡',
  red:    '🔴',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  drafted:   { bg: 'rgba(100,116,139,0.2)',  text: '#94a3b8' },
  approved:  { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
  scheduled: { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  posted:    { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc' },
}

const ALL_STATUSES: PostStatus[] = ['drafted', 'approved', 'scheduled', 'posted']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function truncate(text: string | null, len: number): string {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

function riskDot(risk: string | null): string {
  if (!risk) return '⚪'
  const key = risk.toLowerCase()
  return RISK_DOT[key] ?? '⚪'
}

// ─── ChannelBadge ─────────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: string | null }) {
  if (!channel) return null
  const style = CHANNEL_STYLES[channel]
  if (!style) {
    return (
      <span
        style={{
          background: '#1e293b',
          color: '#94a3b8',
          border: '1px solid #334155',
          padding: '1px 8px',
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {channel}
      </span>
    )
  }
  return (
    <span
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        padding: '1px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
      }}
    >
      {channel}
    </span>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.drafted
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        padding: '1px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}

// ─── PostModal ────────────────────────────────────────────────────────────────


// ─── Canvas Image Generator ───────────────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

// AI-generated: senior exec + technology edge, right-side composition, dark left for text
const CL_BACKGROUNDS = [
  '/cl-bg/bg-1.jpg',  // exec on phone, reviewing docs, night city (closest to spec)
  '/cl-bg/bg-2.png',  // exec boardroom night
  '/cl-bg/bg-3.jpg',  // exec at window
  '/cl-bg/bg-4.png',  // exec at desk, laptop, thoughtful
  '/cl-bg/bg-5.png',  // two execs, boardroom
  '/cl-bg/bg-6.jpg',  // exec walking corridor
  '/cl-bg/bg-7.png',  // exec on phone at window
]

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function generateCanvasImage(hook: string, channel: string, comment?: string, attempt = 0): Promise<string> {
  const W = 1200, H = 675
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const clean = hook.replace(/^["\u2018\u2019\u201c\u201d]+|["\u2018\u2019\u201c\u201d]+$/g, '').trim()

  if (channel === 'SL' || channel === 'CP') {
    // Searchline brand template: flat dark navy, hook left, logo mark bottom-right
    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, W, H)

    // Hook text — bold white, left-aligned, upper-left zone
    const fontSize = clean.length > 80 ? 52 : clean.length > 50 ? 60 : 68
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'alphabetic'
    const lines = wrapText(ctx, clean, W * 0.56)
    const lh = fontSize * 1.25
    const startY = H * 0.28
    lines.forEach((line, i) => ctx.fillText(line, 72, startY + i * lh))

    // Searchline logo mark — bottom right
    const cx = W - 165, cy = H - 148, R = 108

    // Orange glow
    const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.8)
    glow.addColorStop(0, 'rgba(249,115,22,0.4)')
    glow.addColorStop(0.5, 'rgba(249,115,22,0.15)')
    glow.addColorStop(1, 'rgba(249,115,22,0)')
    ctx.fillStyle = glow
    ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4)

    // Circle ring
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.strokeStyle = '#f97316'
    ctx.lineWidth = 4
    ctx.shadowColor = '#f97316'
    ctx.shadowBlur = 12
    ctx.stroke()
    ctx.shadowBlur = 0

    // 5 waveform bars (waveform/equalizer, tallest centre)
    const barHeights = [0.36, 0.60, 0.84, 0.60, 0.36]
    const barW = 13, barGap = 11
    const totalBarsW = barHeights.length * barW + (barHeights.length - 1) * barGap
    const barsStartX = cx - totalBarsW / 2
    const maxBarH = R * 1.05
    ctx.shadowColor = '#f97316'
    ctx.shadowBlur = 8
    barHeights.forEach((rel, i) => {
      const bh = maxBarH * rel
      const bx = barsStartX + i * (barW + barGap)
      const by = cy - bh / 2
      ctx.beginPath()
      ctx.roundRect(bx, by, barW, bh, 5)
      ctx.fillStyle = '#f97316'
      ctx.fill()
    })
    ctx.shadowBlur = 0

    // Searchline wordmark below logo
    ctx.font = '600 21px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'center'
    ctx.fillText('Searchline', cx, cy + R + 30)
    ctx.textAlign = 'left'

  } else {
    // Craig LinkedIn — executive photo style, tech edge, colour treatment
    // Parse comment for style hints
    const c = (comment || '').toLowerCase()
    const wantDarker  = c.includes('dark') || c.includes('moody')
    const wantLighter = c.includes('light') || c.includes('bright') || c.includes('vivid')
    const wantWarm    = c.includes('warm') || c.includes('gold') || c.includes('amber')
    const wantTech    = c.includes('tech') || c.includes('screen') || c.includes('digital') || c.includes('data')
    const wantBoard   = c.includes('board') || c.includes('meeting') || c.includes('team') || c.includes('present')

    // Base index from hook hash, shifted by attempt + comment length so each retry is different
    const base = Math.abs(clean.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0))
    const bgIndex = (base + attempt + (comment ? comment.length : 0)) % CL_BACKGROUNDS.length
    const bgImg = await loadImage(CL_BACKGROUNDS[bgIndex])

    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, H)
    } else {
      ctx.fillStyle = '#050d1e'
      ctx.fillRect(0, 0, W, H)
    }

    // --- Colour treatment: dark overlay + coloured tint for technology edge ---
    // Base dark overlay
    const overlayOpacity = wantDarker ? 0.82 : wantLighter ? 0.62 : 0.74
    const overlay = ctx.createLinearGradient(0, 0, W, 0)
    overlay.addColorStop(0,    `rgba(4,9,22,${overlayOpacity})`)
    overlay.addColorStop(0.52, `rgba(4,9,22,${overlayOpacity - 0.1})`)
    overlay.addColorStop(1,    `rgba(4,9,22,${overlayOpacity - 0.35})`)
    ctx.fillStyle = overlay
    ctx.fillRect(0, 0, W, H)

    // Colour tint layer — cyan/teal default, amber if warm, electric blue if tech
    let tintR = 0, tintG = 200, tintB = 255, tintA = 0.10  // cyan default
    if (wantWarm)  { tintR = 245; tintG = 158; tintB = 11;  tintA = 0.12 }
    if (wantTech)  { tintR = 99;  tintG = 102; tintB = 241; tintA = 0.14 }
    if (wantBoard) { tintR = 16;  tintG = 185; tintB = 129; tintA = 0.10 }
    const tint = ctx.createLinearGradient(0, H, W, 0)
    tint.addColorStop(0, `rgba(${tintR},${tintG},${tintB},${tintA + 0.06})`)
    tint.addColorStop(1, `rgba(${tintR},${tintG},${tintB},0)`)
    ctx.fillStyle = tint
    ctx.fillRect(0, 0, W, H)

    // Left accent bar — coloured
    ctx.fillStyle = `rgba(${tintR},${tintG},${tintB},0.9)`
    ctx.fillRect(0, 0, 5, H)

    // Subtle bottom vignette
    const vignette = ctx.createLinearGradient(0, H * 0.7, 0, H)
    vignette.addColorStop(0, 'rgba(4,9,22,0)')
    vignette.addColorStop(1, 'rgba(4,9,22,0.55)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // Hook text — bold white, vertically centred, left side
    const fontSize = clean.length > 80 ? 48 : clean.length > 50 ? 56 : 64
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'alphabetic'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 18
    const lines = wrapText(ctx, clean, W * 0.54)
    const lh = fontSize * 1.28
    const textBlock = lines.length * lh
    const startY = (H - textBlock) / 2 + fontSize
    lines.forEach((line, i) => ctx.fillText(line, 64, startY + i * lh))
    ctx.shadowBlur = 0
  }

  return canvas.toDataURL('image/png')
}

function PostModal({
  post,
  onClose,
  onApprove,
  onBackToDraft,
  onDelete,
  onFieldSaved,
}: {
  post: RadarPost
  onClose: () => void
  onApprove: (id: string) => Promise<void>
  onBackToDraft: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onFieldSaved?: (id: string, field: 'hook' | 'content', value: string) => void
}) {
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(post.status === 'approved')
  const [backingToDraft, setBackingToDraft] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Editable hook
  const [editingHook, setEditingHook] = useState(false)
  const [hookDraft, setHookDraft] = useState(post.hook ?? '')
  const [savedHook, setSavedHook] = useState(post.hook ?? '')
  const [savingHook, setSavingHook] = useState(false)

  // Editable content
  const [editingContent, setEditingContent] = useState(false)
  const [contentDraft, setContentDraft] = useState(post.draft_text ?? '')
  const [savedContent, setSavedContent] = useState(post.draft_text ?? '')
  const [savingContent, setSavingContent] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleApprove = async () => {
    setApproving(true)
    try {
      await onApprove(post.id)
      setApproved(true)
    } finally {
      setApproving(false)
    }
  }

  const handleBackToDraft = async () => {
    setBackingToDraft(true)
    try {
      await onBackToDraft(post.id)
      setApproved(false)
    } finally {
      setBackingToDraft(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(post.id)
      onClose()
    } finally {
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

  const handleSaveHook = async () => {
    if (!supabase) return
    setSavingHook(true)
    try {
      const { error: err } = await supabase
        .from('radar_posts')
        .update({ hook: hookDraft, updated_at: new Date().toISOString() })
        .eq('id', post.id)
      if (!err) {
        setSavedHook(hookDraft)
        setEditingHook(false)
        onFieldSaved?.(post.id, 'hook', hookDraft)
      }
    } finally {
      setSavingHook(false)
    }
  }

  const handleCancelHook = () => {
    setHookDraft(savedHook)
    setEditingHook(false)
  }

  const handleSaveContent = async () => {
    if (!supabase) return
    setSavingContent(true)
    try {
      const { error: err } = await supabase
        .from('radar_posts')
        .update({ draft_text: contentDraft, updated_at: new Date().toISOString() })
        .eq('id', post.id)
      if (!err) {
        setSavedContent(contentDraft)
        setEditingContent(false)
        onFieldSaved?.(post.id, 'content', contentDraft)
      }
    } finally {
      setSavingContent(false)
    }
  }

  const handleCancelContent = () => {
    setContentDraft(savedContent)
    setEditingContent(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(2,6,23,0.9)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 680,
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '24px 24px 16px',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <ChannelBadge channel={post.channel} />
              <span style={{ color: '#64748b', fontSize: 13 }}>{formatDate(post.date)}</span>
              {post.format && (
                <span style={{ color: '#64748b', fontSize: 12, background: '#1e293b', padding: '1px 6px', borderRadius: 4 }}>
                  {post.format}
                </span>
              )}
            </div>
            <p style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
              {post.topic}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: 4, flexShrink: 0,
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Image preview (if already attached) */}
          {post.image_url ? (
            <div style={{ width: '100%', height: 240, overflow: 'hidden' }}>
              <img
                src={post.image_url}
                alt={post.topic ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : null}
          <div style={{ padding: 24 }}>
          {/* Hook */}
          {(post.hook || editingHook) && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Hook</p>
                {!editingHook ? (
                  <button
                    onClick={() => setEditingHook(true)}
                    style={{
                      background: 'none', border: '1px solid #334155', borderRadius: 4,
                      color: '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      padding: '1px 6px', lineHeight: 1.6,
                    }}
                  >✏️ Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={handleSaveHook}
                      disabled={savingHook}
                      style={{
                        background: 'none', border: '1px solid #22c55e', borderRadius: 4,
                        color: '#4ade80', fontSize: 10, fontWeight: 600, cursor: savingHook ? 'not-allowed' : 'pointer',
                        padding: '1px 6px', lineHeight: 1.6, opacity: savingHook ? 0.6 : 1,
                      }}
                    >{savingHook ? '...' : '✓ Save'}</button>
                    <button
                      onClick={handleCancelHook}
                      disabled={savingHook}
                      style={{
                        background: 'none', border: '1px solid #334155', borderRadius: 4,
                        color: '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                        padding: '1px 6px', lineHeight: 1.6,
                      }}
                    >✕</button>
                  </div>
                )}
              </div>
              {editingHook ? (
                <textarea
                  value={hookDraft}
                  onChange={(e) => setHookDraft(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#020617', border: '1px solid #3b82f6',
                    borderRadius: 8, padding: 12,
                    color: '#e2e8f0', fontSize: 14, fontStyle: 'italic',
                    lineHeight: 1.6, fontFamily: 'system-ui, sans-serif',
                    resize: 'vertical', outline: 'none',
                  }}
                />
              ) : (
                <p style={{ color: '#e2e8f0', fontSize: 14, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                  "{savedHook}"
                </p>
              )}
            </div>
          )}

          {/* Draft text */}
          {(post.draft_text || editingContent) && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Draft</p>
                {!editingContent ? (
                  <button
                    onClick={() => setEditingContent(true)}
                    style={{
                      background: 'none', border: '1px solid #334155', borderRadius: 4,
                      color: '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      padding: '1px 6px', lineHeight: 1.6,
                    }}
                  >✏️ Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={handleSaveContent}
                      disabled={savingContent}
                      style={{
                        background: 'none', border: '1px solid #22c55e', borderRadius: 4,
                        color: '#4ade80', fontSize: 10, fontWeight: 600, cursor: savingContent ? 'not-allowed' : 'pointer',
                        padding: '1px 6px', lineHeight: 1.6, opacity: savingContent ? 0.6 : 1,
                      }}
                    >{savingContent ? '...' : '✓ Save'}</button>
                    <button
                      onClick={handleCancelContent}
                      disabled={savingContent}
                      style={{
                        background: 'none', border: '1px solid #334155', borderRadius: 4,
                        color: '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                        padding: '1px 6px', lineHeight: 1.6,
                      }}
                    >✕</button>
                  </div>
                )}
              </div>
              {editingContent ? (
                <textarea
                  value={contentDraft}
                  onChange={(e) => setContentDraft(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#020617', border: '1px solid #3b82f6',
                    borderRadius: 8, padding: 16,
                    color: '#cbd5e1', fontSize: 13,
                    lineHeight: 1.7, fontFamily: 'system-ui, sans-serif',
                    resize: 'vertical', outline: 'none',
                  }}
                />
              ) : (
                <div
                  style={{
                    background: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: 16,
                    color: '#cbd5e1',
                    fontSize: 13,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  {savedContent}
                </div>
              )}
            </div>
          )}

          {/* Risk notes */}
          {post.risk_notes && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                {riskDot(post.risk_status)} Risk Notes
              </p>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6, background: '#020617', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                {post.risk_notes}
              </p>
            </div>
          )}

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>Status:</span>
            <StatusBadge status={post.status} />
          </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #1e293b',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          {/* Primary actions row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {approved ? (
              <span style={{ color: '#4ade80', fontSize: 14, fontWeight: 600 }}>✓ Approved</span>
            ) : (
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: approving ? 'not-allowed' : 'pointer',
                  opacity: approving ? 0.7 : 1,
                }}
              >
                {approving ? 'Approving...' : '✓ Approve'}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 14,
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          {/* Secondary actions row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #1e293b', paddingTop: 10 }}>
            {approved && (
              <button
                onClick={handleBackToDraft}
                disabled={backingToDraft || deleting}
                style={{
                  background: 'none',
                  border: '1px solid #475569',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#94a3b8',
                  cursor: (backingToDraft || deleting) ? 'not-allowed' : 'pointer',
                  opacity: (backingToDraft || deleting) ? 0.6 : 1,
                }}
              >
                {backingToDraft ? '...' : '↩ Back to Draft'}
              </button>
            )}
            {deleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#f87171', fontSize: 12 }}>Are you sure? This cannot be undone.</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: 'none',
                    border: '1px solid #ef4444',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#f87171',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? '...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  style={{
                    background: 'none',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                disabled={deleting || backingToDraft}
                style={{
                  background: 'none',
                  border: '1px solid #7f1d1d',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#f87171',
                  cursor: (deleting || backingToDraft) ? 'not-allowed' : 'pointer',
                  opacity: (deleting || backingToDraft) ? 0.6 : 1,
                }}
              >
                🗑 Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post, onClick }: { post: RadarPost; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#1e293b' : '#0f172a',
        border: `1px solid ${hovered ? '#334155' : '#1e293b'}`,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card image */}
      {post.image_url ? (
        <div style={{ width: '100%', height: 160, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={post.image_url}
            alt={post.topic ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (() => {
        const ch = CHANNEL_STYLES[post.channel ?? '']
        return (
          <div style={{
            width: '100%', height: 80, flexShrink: 0,
            background: ch ? ch.placeholder : '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 24 }}>📡</span>
          </div>
        )
      })()}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {/* Top row: channel + date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <ChannelBadge channel={post.channel} />
        <span style={{
          color: '#93c5fd',
          fontSize: 12,
          fontWeight: 700,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 6,
          padding: '2px 8px',
        }}>
          📅 {formatDate(post.date)}
        </span>
      </div>

      {/* Topic */}
      {post.topic && (
        <p style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
          {post.topic}
        </p>
      )}

      {/* Hook */}
      {post.hook && (
        <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          {truncate(post.hook, 100)}
        </p>
      )}

      {/* Bottom row: status + risk */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <StatusBadge status={post.status} />
        <span style={{ fontSize: 16 }} title={post.risk_status ?? ''}>
          {riskDot(post.risk_status)}
        </span>
      </div>
      </div>
    </div>
  )
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

function StatsBar({ posts, onBulkApprove, bulkApproving }: {
  posts: RadarPost[]
  onBulkApprove: () => void
  bulkApproving: boolean
}) {
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s).length
    return acc
  }, {} as Record<string, number>)
  const flagged = posts.filter((p) => p.risk_status?.toLowerCase() === 'red').length
  const approvable = posts.filter((p) =>
    p.status === 'drafted' && p.risk_status?.toLowerCase() !== 'red'
  ).length

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        {/* Total */}
        <div style={{
          background: 'rgba(248,250,252,0.04)', border: '1px solid #1e293b',
          borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700 }}>{posts.length}</span>
          <span style={{ color: '#64748b', fontSize: 12 }}>Total</span>
        </div>

        {/* Status counts */}
        {ALL_STATUSES.map((s) => {
          const sc = STATUS_COLORS[s]
          return (
            <div key={s} style={{
              background: sc.bg, border: `1px solid ${sc.text}22`,
              borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: sc.text, fontSize: 18, fontWeight: 700 }}>{counts[s]}</span>
              <span style={{ color: sc.text, fontSize: 12, textTransform: 'capitalize' }}>{s}</span>
            </div>
          )
        })}

        {/* Flagged */}
        <div style={{
          background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#f87171', fontSize: 18, fontWeight: 700 }}>{flagged}</span>
          <span style={{ color: '#f87171', fontSize: 12 }}>🔴 Flagged</span>
        </div>
      </div>

      {/* Bulk approve button */}
      {approvable > 0 && (
        <button
          onClick={onBulkApprove}
          disabled={bulkApproving}
          style={{
            background: bulkApproving ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: 8,
            padding: '8px 20px',
            color: '#4ade80',
            fontSize: 13,
            fontWeight: 700,
            cursor: bulkApproving ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {bulkApproving ? 'Approving...' : `✓ Bulk Approve All (${approvable} posts)`}
        </button>
      )}
    </div>
  )
}

// ─── Article types ──────────────────────────────────────────────────────────────

interface RadarArticle {
  id: string
  title: string
  slug: string
  summary: string | null
  keywords: string[] | null
  body_md: string | null
  status: 'drafted' | 'approved' | 'published'
  seo_focus: string | null
  aeo_questions: string[] | null
  image_url: string | null
  created_at: string
}

const ARTICLE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  drafted:   { bg: 'rgba(100,116,139,0.2)',  text: '#94a3b8' },
  approved:  { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
  published: { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc' },
}

// ─── ArticlesSection ──────────────────────────────────────────────────────────

function ArticlesSection() {
  const [articles, setArticles] = useState<RadarArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('radar_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setArticles((data ?? []) as RadarArticle[])
        setLoading(false)
        return
      })
      .then(undefined, () => setLoading(false))
  }, [])

  const handleUploadImage = async (id: string, file: File) => {
    if (!supabase) return
    setUploading(id)
    try {
      // Convert file to base64 and send to server-side API (avoids storage RLS)
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      const res = await fetch('/api/upload-article-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: id,
          fileName: file.name,
          contentType: file.type,
          fileBase64: base64,
        }),
      })
      const json = await res.json()
      if (!res.ok) { alert('Upload failed: ' + (json.error ?? res.status)); return }
      const publicUrl = json.url as string
      const { error: patchErr } = await supabase
        .from('radar_articles')
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (!patchErr) {
        setArticles((prev) => prev.map((a) => a.id === id ? { ...a, image_url: publicUrl } : a))
      }
    } finally {
      setUploading(null)
    }
  }

  const handleApprove = async (id: string) => {
    if (!supabase) return
    setApproving(id)
    const { error: err } = await supabase
      .from('radar_articles')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      setArticles((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' as const } : a))
    }
    setApproving(null)
  }

  const handlePublish = async (id: string) => {
    if (!supabase) return
    setPublishing(id)
    const { error: err } = await supabase
      .from('radar_articles')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      setArticles((prev) => prev.map((a) => a.id === id ? { ...a, status: 'published' as const } : a))
    }
    setPublishing(null)
  }

  return (
    <div style={{ marginTop: 56 }}>
      <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>
        📝 Articles
      </h2>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>
        SEO & AEO content drafts for Searchline
      </p>

      {loading && <p style={{ color: '#64748b', fontSize: 13 }}>Loading articles...</p>}

      {!loading && articles.length === 0 && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '32px 24px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          No articles yet. Create articles in the{' '}
          <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: 4, color: '#f8fafc' }}>radar_articles</code>{' '}
          table to activate this section.
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {articles.map((article) => {
            const sc = ARTICLE_STATUS_COLORS[article.status] ?? ARTICLE_STATUS_COLORS.drafted
            const isExpanded = expanded === article.id
            return (
              <div key={article.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
                {/* Article row */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{
                        background: sc.bg, color: sc.text,
                        padding: '1px 8px', borderRadius: 9999,
                        fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                      }}>{article.status}</span>
                      {article.seo_focus && (
                        <span style={{
                          background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                          padding: '1px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                          border: '1px solid rgba(251,191,36,0.2)',
                        }}>
                          🎯 {article.seo_focus}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{article.title}</p>
                    {article.keywords && article.keywords.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {article.keywords.map((kw, i) => (
                          <span key={i} style={{
                            background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                            border: '1px solid rgba(59,130,246,0.2)',
                            padding: '1px 7px', borderRadius: 9999, fontSize: 11,
                          }}>{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    {/* Image thumbnail if uploaded */}
                    {article.image_url && (
                      <img src={article.image_url} alt="cover" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #1e293b' }} />
                    )}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : article.id)}
                        style={{
                          background: 'none', border: '1px solid #334155',
                          borderRadius: 6, padding: '5px 10px',
                          color: '#94a3b8', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? '▲' : '▼ View'}
                      </button>

                      {/* Upload image button */}
                      {article.status !== 'published' && (
                        <label style={{
                          background: uploading === article.id ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.12)',
                          border: '1px solid rgba(99,102,241,0.4)',
                          borderRadius: 6, padding: '5px 10px',
                          color: '#a5b4fc', fontSize: 12, fontWeight: 600,
                          cursor: uploading === article.id ? 'not-allowed' : 'pointer',
                          display: 'inline-block',
                        }}>
                          {uploading === article.id ? '⏳' : (article.image_url ? '🖼 Change' : '🖼 Image')}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={uploading === article.id}
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handleUploadImage(article.id, f)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}

                      {/* Approve button — only for drafted */}
                      {article.status === 'drafted' && (
                        <button
                          onClick={() => handleApprove(article.id)}
                          disabled={approving === article.id}
                          style={{
                            background: approving === article.id ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.12)',
                            border: '1px solid rgba(34,197,94,0.4)',
                            borderRadius: 6, padding: '5px 10px',
                            color: '#4ade80', fontSize: 12, fontWeight: 700,
                            cursor: approving === article.id ? 'not-allowed' : 'pointer',
                            opacity: approving === article.id ? 0.7 : 1,
                          }}
                        >
                          {approving === article.id ? '...' : '✓ Approve'}
                        </button>
                      )}

                      {/* Publish button — only for approved */}
                      {article.status === 'approved' && (
                        <button
                          onClick={() => handlePublish(article.id)}
                          disabled={publishing === article.id}
                          style={{
                            background: publishing === article.id ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.15)',
                            border: '1px solid rgba(168,85,247,0.4)',
                            borderRadius: 6, padding: '5px 10px',
                            color: '#c084fc', fontSize: 12, fontWeight: 700,
                            cursor: publishing === article.id ? 'not-allowed' : 'pointer',
                            opacity: publishing === article.id ? 0.7 : 1,
                          }}
                        >
                          {publishing === article.id ? '...' : '🚀 Publish'}
                        </button>
                      )}

                      {article.status === 'published' && (
                        <span style={{ color: '#c084fc', fontSize: 12, fontWeight: 600 }}>✓ Live</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Expanded draft preview */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #1e293b', padding: 20, background: '#020617' }}>
                    {article.summary && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Summary</p>
                        <p style={{ color: '#cbd5e1', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{article.summary}</p>
                      </div>
                    )}
                    {article.aeo_questions && article.aeo_questions.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>AEO Questions</p>
                        <ul style={{ margin: 0, paddingLeft: 18, color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
                          {article.aeo_questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>
                    )}
                    {article.body_md && (
                      <div>
                        <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Article Body</p>
                        <pre style={{
                          color: '#cbd5e1', fontSize: 12, lineHeight: 1.7,
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          margin: 0, fontFamily: 'system-ui, sans-serif',
                          background: '#0a0f1e', border: '1px solid #1e293b',
                          borderRadius: 8, padding: 16,
                        }}>
                          {article.body_md}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Radar page ───────────────────────────────────────────────────────────────


// --- MetricsSection

function MetricsSection() {
  const [metrics, setMetrics] = useState<RadarMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('radar_metrics')
      .select('*')
      .order('week_of', { ascending: false })
      .then(({ data }) => {
        setMetrics((data ?? []) as RadarMetric[])
        setLoading(false)
        return
      })
      .then(undefined, () => setLoading(false))
  }, [])

  const baseline = metrics[metrics.length - 1] ?? null

  return (
    <div style={{ marginTop: 56 }}>
      <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>
        📊 Metrics Tracker
      </h2>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>
        Weekly LinkedIn stats - Craig's personal account
      </p>

      {loading && <p style={{ color: '#64748b', fontSize: 13 }}>Loading metrics...</p>}

      {!loading && metrics.length === 0 && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '32px 24px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          No metrics yet. Run the migration in Supabase Studio to activate this section.
        </div>
      )}

      {!loading && metrics.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                {['Week', 'Followers', 'Δ Since Day 0', 'Impressions', 'Profile Views', 'Posts', 'Notes'].map((h) => (
                  <th key={h} style={{ background: '#0f172a', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => {
                const isBaseline = i === metrics.length - 1
                const delta = baseline ? m.followers - baseline.followers : null
                return (
                  <tr key={m.id} style={{ background: isBaseline ? 'rgba(59,130,246,0.06)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a', color: '#f8fafc', fontWeight: isBaseline ? 700 : 400 }}>
                      {new Date(m.week_of).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      {isBaseline && (
                        <span style={{ marginLeft: 8, background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>Day 0</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a', color: '#e2e8f0' }}>{m.followers.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a' }}>
                      {isBaseline ? (
                        <span style={{ color: '#64748b' }}>- baseline</span>
                      ) : delta !== null ? (
                        <span style={{ color: delta >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>{delta >= 0 ? '+' : ''}{delta.toLocaleString()}</span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a', color: '#e2e8f0' }}>{m.post_impressions?.toLocaleString() ?? '-'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a', color: '#e2e8f0' }}>{m.profile_viewers?.toLocaleString() ?? '-'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a', color: '#e2e8f0' }}>{m.posts_published ?? '-'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #0f172a', color: '#64748b', fontSize: 12, maxWidth: 200 }}>{m.notes ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// --- AssetsSection

const ASSET_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  linkedin_page: { label: 'LinkedIn Page', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  linkedin_post: { label: 'LinkedIn Post', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
}

function AssetCard({ asset }: { asset: RadarAsset }) {
  const [expanded, setExpanded] = useState(false)
  const typeStyle = ASSET_TYPE_LABELS[asset.asset_type] ?? { label: asset.asset_type, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded((x) => !x)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ background: typeStyle.bg, color: typeStyle.color, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{typeStyle.label}</span>
            <span style={{ background: asset.status === 'draft' ? 'rgba(100,116,139,0.2)' : 'rgba(34,197,94,0.15)', color: asset.status === 'draft' ? '#94a3b8' : '#4ade80', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 9999, textTransform: 'capitalize' }}>{asset.status}</span>
          </div>
          <p style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: 0 }}>{asset.name}</p>
        </div>
        <span style={{ color: '#64748b', fontSize: 18, flexShrink: 0, display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #1e293b', padding: 16, background: '#020617' }}>
          <pre style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'system-ui, sans-serif' }}>{asset.content}</pre>
        </div>
      )}
    </div>
  )
}

function AssetsSection() {
  const [assets, setAssets] = useState<RadarAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase
      .from('radar_assets')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setAssets((data ?? []) as RadarAsset[])
        setLoading(false)
        return
      })
      .then(undefined, () => setLoading(false))
  }, [])

  const groups = [
    { key: 'linkedin_page', assets: assets.filter((a) => a.asset_type === 'linkedin_page') },
    { key: 'linkedin_post', assets: assets.filter((a) => a.asset_type === 'linkedin_post') },
  ].filter((g) => g.assets.length > 0)

  return (
    <div style={{ marginTop: 56 }}>
      <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>
        🗂 Assets Library
      </h2>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>
        Searchline LinkedIn page copy and starter posts
      </p>

      {loading && <p style={{ color: '#64748b', fontSize: 13 }}>Loading assets...</p>}

      {!loading && assets.length === 0 && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '32px 24px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          No assets yet. Run the migration in Supabase Studio to activate this section.
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {groups.map((group) => {
            const typeStyle = ASSET_TYPE_LABELS[group.key] ?? { label: group.key, color: '#94a3b8', bg: '' }
            return (
              <div key={group.key}>
                <h3 style={{ color: typeStyle.color, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
                  {typeStyle.label} ({group.assets.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- WeeklyRhythmSection

const WEEKLY_RHYTHM = [
  { day: 'Monday',    emoji: '🔍', task: 'Trend scan',               detail: 'Review top posts, competitors, emerging angles' },
  { day: 'Tuesday',   emoji: '✏️',  task: 'Draft content',           detail: "Write the week's posts based on approved topics" },
  { day: 'Wednesday', emoji: '🛡️', task: 'Risk review',            detail: 'Check drafts for tone, accuracy, compliance' },
  { day: 'Thursday',  emoji: '✅',  task: 'Approve + schedule',      detail: 'Final approval and queue posts for publishing' },
  { day: 'Friday',    emoji: '📊', task: 'Report + update metrics',  detail: 'Log weekly stats and update Radar metrics tracker' },
]

function WeeklyRhythmSection() {
  return (
    <div style={{ marginTop: 56, marginBottom: 64 }}>
      <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>
        📅 Weekly Rhythm
      </h2>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>
        Operating cadence for the 14-day Radar test
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {WEEKLY_RHYTHM.map((item) => (
          <div key={item.day} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.emoji}</div>
            <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{item.day}</p>
            <p style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{item.task}</p>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const TABLE_NOT_FOUND_CODES = ['42P01', 'PGRST116']
function isTableMissingError(msg: string): boolean {
  return msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('relation') || TABLE_NOT_FOUND_CODES.some((c) => msg.includes(c))
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

// ─── ImageStudioSection ───────────────────────────────────────────────────────

function ImageStudioSection() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    setImageUrl(null)
    try {
      const dataUrl = await generateCanvasImage(prompt, 'CL')
      setImageUrl(dataUrl)
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `radar-image-${Date.now()}.png`
    a.click()
  }

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 760 }}>
      <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
        Image Studio
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 32px', lineHeight: 1.6 }}>
        Generate LinkedIn post images. Enter a prompt or hook, then download and attach to your post manually.
      </p>

      {/* Prompt input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Prompt / Hook
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Why most AI hiring tools still miss the point — and what actually works"
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '12px 14px',
            color: '#f8fafc',
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'system-ui, sans-serif',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#334155' }}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        style={{
          background: generating || !prompt.trim() ? '#1e293b' : '#7c3aed',
          color: generating || !prompt.trim() ? '#475569' : '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: 14,
          fontWeight: 700,
          cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
          marginBottom: 32,
          transition: 'background 0.15s',
        }}
      >
        {generating ? '⏳ Generating...' : '🎨 Generate Image'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          padding: '12px 16px',
          color: '#f87171',
          fontSize: 13,
          marginBottom: 24,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Spinner while generating */}
      {generating && (
        <div style={{
          width: '100%',
          height: 300,
          background: '#0a0f1e',
          border: '1px solid #1e293b',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 32, height: 32,
            border: '3px solid #1e293b',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: '#64748b', fontSize: 14 }}>Building your image...</span>
        </div>
      )}

      {/* Generated image */}
      {imageUrl && !generating && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <img
            src={imageUrl}
            alt="Generated"
            style={{ width: '100%', display: 'block' }}
          />
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderTop: '1px solid #1e293b',
            background: '#0a0f1e',
          }}>
            <button
              onClick={handleDownload}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ⬇ Download PNG
            </button>
            <button
              onClick={handleGenerate}
              style={{
                background: 'none',
                color: '#a78bfa',
                border: '1px solid #7c3aed',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Regenerate
            </button>
            <span style={{ color: '#475569', fontSize: 12, flex: 1 }}>
              Download and attach to your post manually in LinkedIn
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'posts',    icon: '📋', label: 'Mission Control' },
  { id: 'articles', icon: '📰', label: 'Articles' },
  { id: 'metrics',  icon: '📊', label: 'Metrics' },
  { id: 'assets',   icon: '🗂️', label: 'Assets' },
  { id: 'rhythm',   icon: '📅', label: 'Weekly Rhythm' },
  { id: 'images',   icon: '🎨', label: 'Image Studio' },
]

// ─── PostsSection ─────────────────────────────────────────────────────────────

function PostsSection({
  posts,
  loading,
  error,
  setupNeeded,
  loadPosts,
  filterStatus,
  setFilterStatus,
  filterChannel,
  setFilterChannel,
  filtered,
  channels,
  bulkApproving,
  handleBulkApprove,
  setSelected,
}: {
  posts: RadarPost[]
  loading: boolean
  error: string | null
  setupNeeded: boolean
  loadPosts: () => void
  filterStatus: PostStatus | 'all'
  setFilterStatus: (s: PostStatus | 'all') => void
  filterChannel: string
  setFilterChannel: (c: string) => void
  filtered: RadarPost[]
  channels: (string | null)[]
  bulkApproving: boolean
  handleBulkApprove: () => void
  setSelected: (post: RadarPost) => void
}) {
  return (
    <div style={{ padding: '32px 32px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
              📋 Mission Control
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
              14-day content test · May 6-19
            </p>
          </div>
          <button
            onClick={loadPosts}
            style={{
              background: 'none',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#64748b',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12, color: '#64748b' }}>
          <div
            style={{
              width: 20, height: 20,
              border: '2px solid #1e293b',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: 14 }}>Loading posts...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ color: '#f87171', fontSize: 14, marginBottom: 16 }}>{error}</p>
          <button
            onClick={loadPosts}
            style={{ border: '1px solid #374151', borderRadius: 8, background: 'none', color: '#94a3b8', padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Setup Needed */}
      {!loading && setupNeeded && (
        <div style={{
          background: '#0f172a', border: '1px solid #f59e0b44',
          borderRadius: 16, padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Setup needed</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
            The <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: 4, color: '#f8fafc' }}>radar_posts</code> table doesn't exist yet.<br />
            Run the Supabase migration to activate the content calendar.
          </p>
          <div style={{
            background: '#020617', border: '1px solid #1e293b', borderRadius: 8,
            padding: '16px 20px', textAlign: 'left', display: 'inline-block', maxWidth: 480, width: '100%',
          }}>
            <p style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Steps</p>
            <ol style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.9, margin: 0, paddingLeft: 20 }}>
              <li>Open <strong>Supabase Studio</strong> for your project</li>
              <li>Go to <strong>SQL Editor</strong></li>
              <li>Run the <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: 4 }}>radar_posts</code> migration from <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: 4 }}>supabase/migrations/</code></li>
              <li>Click <strong>Refresh</strong> above</li>
            </ol>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && !setupNeeded && (
        <>
          {/* Stats bar */}
          <StatsBar posts={posts} onBulkApprove={handleBulkApprove} bulkApproving={bulkApproving} />

          {/* Channel tab filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {['all', ...channels].map((ch) => {
              const active = filterChannel === ch
              const chStyle = ch !== 'all' ? CHANNEL_STYLES[ch as string] : null
              return (
                <button
                  key={ch as string}
                  onClick={() => setFilterChannel(ch as string)}
                  style={{
                    background: active
                      ? (chStyle ? chStyle.bg : '#3b82f6')
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? (chStyle ? chStyle.border : '#2563eb') : '#1e293b'}`,
                    borderRadius: 8,
                    padding: '6px 14px',
                    color: active ? '#fff' : '#94a3b8',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {ch === 'all' ? 'All' : ch as string}
                </button>
              )
            })}
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {(['all', ...ALL_STATUSES] as const).map((s) => {
              const active = filterStatus === s
              const sc = s !== 'all' ? STATUS_COLORS[s] : null
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as PostStatus | 'all')}
                  style={{
                    background: active ? (sc ? sc.bg : 'rgba(255,255,255,0.08)') : 'transparent',
                    border: `1px solid ${active ? (sc ? sc.text + '44' : '#475569') : '#1e293b'}`,
                    borderRadius: 8,
                    padding: '5px 12px',
                    color: active ? (sc ? sc.text : '#f8fafc') : '#64748b',
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {s === 'all' ? 'All statuses' : s}
                </button>
              )
            })}
          </div>

          {/* Card grid */}
          {filtered.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '48px 24px', fontSize: 14 }}>
              No posts match the current filter.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              {filtered.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelected(post)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Radar page ───────────────────────────────────────────────────────────────

export default function Radar() {
  const [posts, setPosts] = useState<RadarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [selected, setSelected] = useState<RadarPost | null>(null)
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [bulkApproving, setBulkApproving] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('posts')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const loadPosts = async () => {
    setLoading(true)
    setError(null)
    setSetupNeeded(false)
    if (!supabase) {
      setError('Supabase not configured - set VITE_SUPABASE_ANON_KEY in .env')
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('radar_posts')
      .select('*')
      .order('date', { ascending: true })
    if (err) {
      if (isTableMissingError(err.message) || isTableMissingError(err.code ?? '')) {
        setSetupNeeded(true)
      } else {
        setError(err.message)
      }
    } else {
      setPosts((data ?? []) as RadarPost[])
    }
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  const fireWebhook = async (post: RadarPost) => {
    const webhookUrl = import.meta.env.VITE_MAKE_RADAR_WEBHOOK_URL
    if (!webhookUrl) return
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          channel: post.channel ?? '',
          topic: post.topic ?? '',
          hook: post.hook ?? '',
          draft_text: post.draft_text ?? '',
          scheduled_date: post.date ?? '',
          risk_status: post.risk_status ?? '',
        }),
      })
    } catch {
      // Silently ignore webhook errors - don't break the UI
    }
  }

  const handleApprove = async (id: string) => {
    if (!supabase) return
    const { error: err } = await supabase
      .from('radar_posts')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      const post = posts.find((p) => p.id === id)
      if (post) await fireWebhook({ ...post, status: 'approved' })
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'approved' as PostStatus } : p))
    }
  }

  const handleBackToDraft = async (id: string) => {
    if (!supabase) return
    const { error: err } = await supabase
      .from('radar_posts')
      .update({ status: 'drafted', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'drafted' as PostStatus } : p))
      setSelected((prev) => prev?.id === id ? { ...prev, status: 'drafted' as PostStatus } : prev)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    const { error: err } = await supabase
      .from('radar_posts')
      .delete()
      .eq('id', id)
    if (!err) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleBulkApprove = async () => {
    if (!supabase) return
    setBulkApproving(true)
    const toApprove = posts.filter((p) =>
      p.status === 'drafted' && p.risk_status?.toLowerCase() !== 'red'
    )
    if (toApprove.length === 0) { setBulkApproving(false); return }
    const ids = toApprove.map((p) => p.id)
    const { error: err } = await supabase
      .from('radar_posts')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .in('id', ids)
    if (!err) {
      await Promise.all(
        toApprove.map((p) => fireWebhook({ ...p, status: 'approved' }))
      )
      setPosts((prev) =>
        prev.map((p) => ids.includes(p.id) ? { ...p, status: 'approved' as PostStatus } : p)
      )
    }
    setBulkApproving(false)
  }

  const filtered = posts.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterChannel !== 'all' && p.channel !== filterChannel) return false
    return true
  })

  const channels = Array.from(new Set(posts.map((p) => p.channel).filter(Boolean)))

  const SIDEBAR_WIDTH = sidebarCollapsed ? 56 : 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <div
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          background: '#020617',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 200ms ease, min-width 200ms ease',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          height: '100vh',
          maxHeight: '100vh',
        }}
      >
        {/* Logo area */}
        <div
          style={{
            padding: sidebarCollapsed ? '20px 0' : '20px 16px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <img
            src="/second-orbit-logo.svg"
            alt="Second Orbit"
            style={{ width: 28, height: 28, flexShrink: 0 }}
            onError={(e) => {
              // Fallback to emoji if SVG not found
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          {!sidebarCollapsed && (
            <span style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
              Second Orbit
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: sidebarCollapsed ? '8px 0' : '8px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', minHeight: 0 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? 0 : 10,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '8px 0' : '7px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                  borderLeft: isActive ? '2px solid #f97316' : '2px solid transparent',
                  color: isActive ? '#fff' : '#64748b',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div style={{ padding: sidebarCollapsed ? '12px 0' : '12px 8px', borderTop: '1px solid #1e293b', flexShrink: 0, display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-end' }}>
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'none',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '6px 8px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? (
                // Chevron right
                <polyline points="9 18 15 12 9 6" />
              ) : (
                // Chevron left
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#0a0f1e',
          minWidth: 0,
        }}
      >
        {activeSection === 'posts' && (
          <PostsSection
            posts={posts}
            loading={loading}
            error={error}
            setupNeeded={setupNeeded}
            loadPosts={loadPosts}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterChannel={filterChannel}
            setFilterChannel={setFilterChannel}
            filtered={filtered}
            channels={channels}
            bulkApproving={bulkApproving}
            handleBulkApprove={handleBulkApprove}
            setSelected={setSelected}
          />
        )}
        {activeSection === 'articles' && (
          <div style={{ padding: '32px 32px 48px' }}>
            <ArticlesSection />
          </div>
        )}
        {activeSection === 'metrics' && (
          <div style={{ padding: '32px 32px 48px' }}>
            <MetricsSection />
          </div>
        )}
        {activeSection === 'assets' && (
          <div style={{ padding: '32px 32px 48px' }}>
            <AssetsSection />
          </div>
        )}
        {activeSection === 'rhythm' && (
          <div style={{ padding: '32px 32px 48px' }}>
            <WeeklyRhythmSection />
          </div>
        )}
        {activeSection === 'images' && (
          <ImageStudioSection />
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Modal */}
      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
          onApprove={async (id) => {
            await handleApprove(id)
            setSelected((prev) => prev?.id === id ? { ...prev, status: 'approved' } : prev)
          }}
          onBackToDraft={handleBackToDraft}
          onDelete={async (id) => {
            await handleDelete(id)
            setSelected(null)
          }}
          onFieldSaved={(id, field, value) => {
            setPosts((prev) => prev.map((p) =>
              p.id === id
                ? { ...p, ...(field === 'hook' ? { hook: value } : { draft_text: value }) }
                : p
            ))
            setSelected((prev) =>
              prev?.id === id
                ? { ...prev, ...(field === 'hook' ? { hook: value } : { draft_text: value }) }
                : prev
            )
          }}
        />
      )}
    </div>
  )
}
