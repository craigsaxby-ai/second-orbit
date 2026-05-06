import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = 'drafted' | 'approved' | 'scheduled' | 'posted'

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
  created_at: string
  updated_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CHANNEL_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CL:  { label: 'Craig LinkedIn',          color: '#fff',     bg: '#3b82f6',    border: '#2563eb' },
  SL:  { label: 'Searchline Page',         color: '#fff',     bg: '#f97316',    border: '#ea580c' },
  EFN: { label: 'Erica Field Note',        color: '#fff',     bg: '#a855f7',    border: '#9333ea' },
  CP:  { label: 'Comment Prompt',          color: '#fff',     bg: '#22c55e',    border: '#16a34a' },
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
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function truncate(text: string | null, len: number): string {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '…' : text
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

function PostModal({
  post,
  onClose,
  onApprove,
}: {
  post: RadarPost
  onClose: () => void
  onApprove: (id: string) => Promise<void>
}) {
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(post.status === 'approved')

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
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
          {/* Hook */}
          {post.hook && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Hook</p>
              <p style={{ color: '#e2e8f0', fontSize: 14, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                "{post.hook}"
              </p>
            </div>
          )}

          {/* Draft text */}
          {post.draft_text && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Draft</p>
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
                {post.draft_text}
              </div>
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

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #1e293b',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
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
              {approving ? 'Approving…' : '✓ Approve'}
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
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Top row: channel + date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <ChannelBadge channel={post.channel} />
        <span style={{ color: '#64748b', fontSize: 12 }}>{formatDate(post.date)}</span>
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
  )
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

function StatsBar({ posts }: { posts: RadarPost[] }) {
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 32,
      }}
    >
      {ALL_STATUSES.map((s) => {
        const sc = STATUS_COLORS[s]
        return (
          <div
            key={s}
            style={{
              background: sc.bg,
              border: `1px solid ${sc.text}22`,
              borderRadius: 8,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: sc.text, fontSize: 18, fontWeight: 700 }}>{counts[s]}</span>
            <span style={{ color: sc.text, fontSize: 12, textTransform: 'capitalize' }}>{s}</span>
          </div>
        )
      })}
      <div
        style={{
          background: 'rgba(248,250,252,0.04)',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700 }}>{posts.length}</span>
        <span style={{ color: '#64748b', fontSize: 12 }}>total</span>
      </div>
    </div>
  )
}

// ─── Radar page ───────────────────────────────────────────────────────────────

export default function Radar() {
  const [posts, setPosts] = useState<RadarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<RadarPost | null>(null)
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')

  const loadPosts = async () => {
    setLoading(true)
    setError(null)
    if (!supabase) {
      setError('Supabase not configured — set VITE_SUPABASE_ANON_KEY in .env')
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('radar_posts')
      .select('*')
      .order('date', { ascending: true })
    if (err) {
      setError(err.message)
    } else {
      setPosts((data ?? []) as RadarPost[])
    }
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  const handleApprove = async (id: string) => {
    if (!supabase) return
    const { error: err } = await supabase
      .from('radar_posts')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'approved' as PostStatus } : p))
    }
  }

  const filtered = posts.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterChannel !== 'all' && p.channel !== filterChannel) return false
    return true
  })

  const channels = Array.from(new Set(posts.map((p) => p.channel).filter(Boolean)))

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ color: '#f8fafc', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>
                📡 Radar
              </h1>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                14-day content test · May 6–19
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
            <span style={{ fontSize: 14 }}>Loading posts…</span>
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

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats bar */}
            <StatsBar posts={posts} />

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as PostStatus | 'all')}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  color: '#f8fafc',
                  padding: '6px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">All statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Channel filter */}
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  color: '#f8fafc',
                  padding: '6px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">All channels</option>
                {channels.map((c) => (
                  <option key={c} value={c ?? ''}>{c}</option>
                ))}
              </select>
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
        />
      )}
    </div>
  )
}
