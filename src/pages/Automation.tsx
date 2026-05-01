import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CronJob {
  id: string
  name: string
  description: string | null
  schedule_expr: string
  schedule_human: string
  model: string | null
  model_display: string | null
  delivery_channel: string | null
  delivery_to: string | null
  enabled: boolean
  last_run_at: string | null
  last_run_status: string | null
  next_run_at: string | null
  notes: string | null
  created_at: string
}

// ─── Static config (source of truth — mirrors OpenClaw cron/jobs.json) ────────

const STATIC_JOBS: CronJob[] = [
  {
    id: 'abc7f071-0bbe-4264-b23a-df1620c06df3',
    name: 'Searchline Daily Brief',
    description:
      'Pulls git log from Searchline Engine repo, reads memory files, queries Supabase for open Searchline tasks, marks shipped items as done, and writes a structured daily brief covering progress, blockers, top 3 priorities, cost alerts, and a recommended next action. Delivered to Sax on Telegram every morning.',
    schedule_expr: '50 5 * * *',
    schedule_human: 'Daily at 5:50 AM (Riyadh)',
    model: 'anthropic/claude-haiku-4-5',
    model_display: 'Claude Haiku',
    delivery_channel: 'telegram',
    delivery_to: 'Sax',
    enabled: true,
    last_run_at: null,
    last_run_status: null,
    next_run_at: null,
    notes:
      'Reads SEARCHLINE_MISSION_CONTROL.md for prompt and output rules. Hard cap: 4096 chars (Telegram limit) — splits into Part 1/2 if over limit.',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: '0b409746-4092-4bb8-9106-075f63bc6bdd',
    name: 'Second Orbit Brief',
    description:
      'Covers all non-Searchline products: Candidate Portal, Salary Benchmark, Achievement Record, and Second Orbit Mission Control. Pulls git logs from all 4 repos, reads memory files, queries Supabase for non-searchline tasks, and writes a product-wide progress brief. Runs every 2 days.',
    schedule_expr: '0 7 */2 * *',
    schedule_human: 'Every 2 days at 7:00 AM (Riyadh)',
    model: 'anthropic/claude-haiku-4-5',
    model_display: 'Claude Haiku',
    delivery_channel: 'telegram',
    delivery_to: 'Sax',
    enabled: true,
    last_run_at: null,
    last_run_status: null,
    next_run_at: null,
    notes:
      'Reads SECOND_ORBIT_BRIEF.md for prompt and output rules. Covers repos: candidate-portal, salary-benchmark, proofline (Achievement Record), second-orbit.',
    created_at: '2026-04-29T00:00:00Z',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const abs = Math.abs(diff)
  const future = diff < 0
  const mins = Math.floor(abs / 60000)
  const hrs = Math.floor(abs / 3600000)
  const days = Math.floor(abs / 86400000)

  let label: string
  if (mins < 2) label = 'just now'
  else if (mins < 60) label = `${mins} minutes`
  else if (hrs < 24) label = `${hrs} hour${hrs !== 1 ? 's' : ''}`
  else label = `${days} day${days !== 1 ? 's' : ''}`

  if (label === 'just now') return label
  return future ? `in ${label}` : `${label} ago`
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid #1E2740',
        background: '#020617',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img src="/second-orbit-logo.svg" alt="Second Orbit" style={{ height: 32, width: 'auto' }} />
      </Link>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Home</Link>
        <Link to="/tasks" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Tasks</Link>
        <Link to="/automation" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Automation</Link>
      </div>
    </nav>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: '#64748b', fontSize: 11 }}>—</span>
  if (status === 'ok') return (
    <span style={{ background: '#16a34a22', color: '#4ade80', border: '1px solid #16a34a44', padding: '1px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
      ✅ ok
    </span>
  )
  if (status === 'error') return (
    <span style={{ background: '#dc262622', color: '#f87171', border: '1px solid #dc262644', padding: '1px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
      ❌ error
    </span>
  )
  return (
    <span style={{ background: '#47556922', color: '#94a3b8', border: '1px solid #47556944', padding: '1px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  )
}

// ─── Cron Job Card ────────────────────────────────────────────────────────────

function CronJobCard({ job }: { job: CronJob }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: '#141929',
        border: '1px solid #1E2740',
        borderRadius: 14,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: job.enabled ? '#22c55e' : '#475569',
            marginTop: 5,
            flexShrink: 0,
            boxShadow: job.enabled ? '0 0 6px #22c55e88' : 'none',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 16 }}>{job.name}</span>
            <span
              style={{
                background: job.enabled ? '#16a34a22' : '#47556922',
                color: job.enabled ? '#4ade80' : '#64748b',
                border: `1px solid ${job.enabled ? '#16a34a44' : '#47556944'}`,
                padding: '1px 8px',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {job.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          {job.description && (
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              {job.description}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 22 }}>

        {/* Schedule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>🕐</span>
          <span style={{ color: '#cbd5e1', fontSize: 13 }}>{job.schedule_human}</span>
          <code style={{ background: '#0d1526', border: '1px solid #1E2740', color: '#7dd3fc', fontSize: 11, fontFamily: 'monospace', padding: '1px 7px', borderRadius: 5 }}>
            {job.schedule_expr}
          </code>
        </div>

        {/* LLM */}
        {job.model_display && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13 }}>🤖</span>
            <span style={{ color: '#cbd5e1', fontSize: 13 }}>{job.model_display}</span>
            {job.model && (
              <code style={{ background: '#0d1526', border: '1px solid #1E2740', color: '#a78bfa', fontSize: 11, fontFamily: 'monospace', padding: '1px 7px', borderRadius: 5 }}>
                {job.model}
              </code>
            )}
          </div>
        )}

        {/* Delivery */}
        {(job.delivery_channel || job.delivery_to) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13 }}>📤</span>
            <span style={{ color: '#cbd5e1', fontSize: 13 }}>
              {[
                job.delivery_channel ? job.delivery_channel.charAt(0).toUpperCase() + job.delivery_channel.slice(1) : null,
                job.delivery_to ? `→ ${job.delivery_to}` : null,
              ].filter(Boolean).join(' ')}
            </span>
          </div>
        )}

        {/* Run times */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>Last run:</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{relativeTime(job.last_run_at)}</span>
            <RunStatusBadge status={job.last_run_status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>Next run:</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{relativeTime(job.next_run_at)}</span>
          </div>
        </div>

        {/* Notes collapsible */}
        {job.notes && (
          <div>
            <button
              onClick={() => setExpanded(p => !p)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', fontSize: 12, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              ℹ {expanded ? 'Hide details' : 'Show details'}
              <span style={{ fontSize: 10 }}>{expanded ? '▲' : '▼'}</span>
            </button>
            {expanded && (
              <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, marginTop: 8, padding: '10px 14px', background: '#0d1526', borderRadius: 8, border: '1px solid #1E2740' }}>
                {job.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Planned card ─────────────────────────────────────────────────────────────

function PlannedCard({ name, description }: { name: string; description: string }) {
  return (
    <div
      style={{
        background: '#0d1526',
        border: '1px dashed #1E2740',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        opacity: 0.75,
      }}
    >
      <div>
        <p style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{name}</p>
        <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{description}</p>
      </div>
      <span style={{ background: '#47556920', color: '#64748b', border: '1px solid #47556940', padding: '2px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Coming soon
      </span>
    </div>
  )
}

// ─── Planned automations ──────────────────────────────────────────────────────

const PLANNED_AUTOMATIONS = [
  { name: 'AR: Monthly achievement reminder emails', description: 'Reminds users to log recent achievements, awards, or milestones.' },
  { name: 'Searchline: Weekly candidate pool refresh', description: 'Re-scores and re-ranks dormant candidates against active job specs.' },
  { name: 'Salary Benchmark: Weekly data aggregation', description: 'Aggregates new salary submissions and recalculates percentile bands.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Automation() {
  const [jobs, setJobs] = useState<CronJob[]>(STATIC_JOBS)

  useEffect(() => {
    // Silently try to enrich with live last_run/next_run from Supabase
    async function enrich() {
      if (!supabase) return
      const { data } = await supabase
        .from('cron_jobs')
        .select('id,last_run_at,last_run_status,next_run_at,enabled')
      if (!data || data.length === 0) return
      setJobs(prev =>
        prev.map(job => {
          const live = (data as Partial<CronJob>[]).find(d => d.id === job.id)
          return live ? { ...job, ...live } : job
        })
      )
    }
    enrich()
  }, [])

  const activeCount = jobs.filter(j => j.enabled).length

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', fontFamily: 'system-ui, sans-serif' }}>
      <Nav />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <h1 style={{ color: '#f8fafc', fontSize: 28, fontWeight: 800, margin: 0 }}>
              Automation &amp; Workflows
            </h1>
            <span style={{ background: '#FF6B2B22', color: '#FF6B2B', border: '1px solid #FF6B2B44', padding: '3px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
              {activeCount} active job{activeCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Active cron jobs, AI agents, and scheduled tasks
          </p>
        </div>

        {/* Jobs */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #1E2740' }}>
            Scheduled Jobs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(job => <CronJobCard key={job.id} job={job} />)}
          </div>
        </section>

        {/* Planned */}
        <section>
          <h2 style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #1E2740' }}>
            Planned Automations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PLANNED_AUTOMATIONS.map(p => <PlannedCard key={p.name} name={p.name} description={p.description} />)}
          </div>
        </section>

      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
