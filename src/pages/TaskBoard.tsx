import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'idea' | 'planned' | 'in_progress' | 'done'
type TaskCategory = 'searchline' | 'candidate-portal' | 'salary-benchmark' | 'achievement-record' | 'proofline' | 'second-orbit' | 'openclaw' | 'product-idea' | 'infrastructure'

interface TaskItem {
  id: string
  title: string
  notes: string | null
  status: TaskStatus
  category: TaskCategory
  assignee: string | null
  position: number
  created_at: string
  updated_at: string
}

// ─── Task Templates ──────────────────────────────────────────────────────────

interface TemplateTask {
  title: string
  category: TaskCategory
  assignee: string
}

interface TaskTemplate {
  name: string
  emoji: string
  description: string
  tasks: TemplateTask[]
}

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    name: 'New Feature Sprint',
    emoji: '⚡',
    description: 'Standard feature build: design → build → review → ship',
    tasks: [
      { title: 'Define spec and acceptance criteria', category: 'second-orbit', assignee: 'Sax' },
      { title: 'Build feature — frontend', category: 'second-orbit', assignee: 'ANT' },
      { title: 'Build feature — backend/API', category: 'second-orbit', assignee: 'ANT' },
      { title: 'QA and test on staging', category: 'second-orbit', assignee: 'Sax' },
      { title: 'Deploy to production', category: 'second-orbit', assignee: 'ANT' },
    ],
  },
  {
    name: 'Product Polish Pass',
    emoji: '✨',
    description: 'UI/UX polish, copy improvements, responsiveness',
    tasks: [
      { title: 'Audit all pages for UX gaps', category: 'second-orbit', assignee: 'Nova' },
      { title: 'Fix mobile responsiveness', category: 'second-orbit', assignee: 'ANT' },
      { title: 'Polish copy and empty states', category: 'second-orbit', assignee: 'ANT' },
      { title: 'Test end-to-end flow', category: 'second-orbit', assignee: 'Sax' },
    ],
  },
  {
    name: 'Public Launch Prep',
    emoji: '🚀',
    description: 'Everything needed before going public',
    tasks: [
      { title: 'Set all env vars in Vercel', category: 'infrastructure', assignee: 'Sax' },
      { title: 'Set up Supabase Auth + RLS policies', category: 'infrastructure', assignee: 'ANT' },
      { title: 'Configure custom domain', category: 'infrastructure', assignee: 'Sax' },
      { title: 'Write privacy policy + terms', category: 'second-orbit', assignee: 'Sax' },
      { title: 'SEO: meta tags, og:image, sitemap', category: 'second-orbit', assignee: 'ANT' },
      { title: 'Smoke test all flows', category: 'second-orbit', assignee: 'Sax' },
    ],
  },
  {
    name: 'Searchline Client Onboarding',
    emoji: '👋',
    description: 'Tasks to onboard a new Searchline client',
    tasks: [
      { title: 'Create demo project in Searchline Engine', category: 'searchline', assignee: 'Sax' },
      { title: 'Send Erica pre-screen link to candidate', category: 'searchline', assignee: 'Sax' },
      { title: 'Review scored shortlist with client', category: 'searchline', assignee: 'Sax' },
      { title: 'Follow up: gather client feedback', category: 'searchline', assignee: 'Sax' },
    ],
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const COLUMNS: { status: TaskStatus; label: string; emoji: string }[] = [
  { status: 'idea',        label: 'Ideas',       emoji: '💡' },
  { status: 'planned',     label: 'Planned',     emoji: '📅' },
  { status: 'in_progress', label: 'In Progress', emoji: '⚡' },
  { status: 'done',        label: 'Done',        emoji: '✅' },
]

const STATUS_LABELS: Record<TaskStatus, string> = {
  idea: 'Ideas',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
}

const COLUMN_HEADER_COLOR: Record<TaskStatus, string> = {
  idea:        'text-orange-400 border-orange-500/30',
  planned:     'text-blue-400 border-blue-500/30',
  in_progress: 'text-yellow-400 border-yellow-500/30',
  done:        'text-green-400 border-green-500/30',
}

const CATEGORY_STYLES: Record<TaskCategory, { badge: string; dot: string }> = {
  'searchline':        { badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',      dot: 'bg-blue-400' },
  'candidate-portal':  { badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',          dot: 'bg-sky-400' },
  'salary-benchmark':  { badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',       dot: 'bg-teal-400' },
  'achievement-record':{ badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', dot: 'bg-yellow-400' },
  'proofline':         { badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',       dot: 'bg-rose-400' },
  'second-orbit':      { badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30', dot: 'bg-indigo-400' },
  'openclaw':          { badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', dot: 'bg-purple-400' },
  'product-idea':      { badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', dot: 'bg-orange-400' },
  'infrastructure':    { badge: 'bg-green-500/20 text-green-300 border border-green-500/30',    dot: 'bg-green-400' },
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  'searchline':         'Searchline',
  'candidate-portal':   'Candidate Portal',
  'salary-benchmark':   'Salary Benchmark',
  'achievement-record': 'Achievement Record',
  'proofline':          'Proofline (legacy)',
  'second-orbit':       'Second Orbit',
  'openclaw':           'OpenClaw',
  'product-idea':       'Product Idea',
  'infrastructure':     'Infrastructure',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS) as TaskStatus[]
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[]

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  'w-full text-sm rounded-lg px-2.5 py-1.5 outline-none transition-colors text-slate-100 placeholder:text-slate-600 border'

const inputStyle = { backgroundColor: '#0d1526', borderColor: '#1E2740' }

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onDelete,
  onStatusChange,
  onEdit,
}: {
  task: TaskItem
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (id: string, fields: Partial<TaskItem>) => Promise<void>
}) {
  const [hovered, setHovered] = useState(false)
  const [showMove, setShowMove] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(task.title)
  const [editNotes, setEditNotes] = useState(task.notes ?? '')
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status)
  const [editCategory, setEditCategory] = useState<TaskCategory>(task.category)
  const [editAssignee, setEditAssignee] = useState(task.assignee ?? '')

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(task.title)
    setEditNotes(task.notes ?? '')
    setEditStatus(task.status)
    setEditCategory(task.category)
    setEditAssignee(task.assignee ?? '')
    setEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!editTitle.trim()) return
    setSaving(true)
    try {
      await onEdit(task.id, {
        title: editTitle.trim(),
        notes: editNotes.trim() || null,
        status: editStatus,
        category: editCategory,
        assignee: editAssignee.trim() || null,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Delete this task?')) onDelete(task.id)
  }

  const cat = CATEGORY_STYLES[task.category] ?? { badge: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', dot: 'bg-gray-400' }
  const catLabel = CATEGORY_LABELS[task.category] ?? task.category
  const others = ALL_STATUSES.filter((s) => s !== task.status)

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="rounded-xl border p-3 space-y-2.5"
        style={{ backgroundColor: 'var(--color-card)', borderColor: '#FF6B2B55' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide mb-1">Editing</p>

        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide">Title</label>
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title…"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide">Notes</label>
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Optional notes…"
            rows={3}
            className={`${inputCls} resize-none`}
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle}
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide">Assignee</label>
          <input
            type="text"
            value={editAssignee}
            onChange={(e) => setEditAssignee(e.target.value)}
            placeholder="Assignee…"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving || !editTitle.trim()}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 min-h-[32px]"
            style={{ backgroundColor: 'var(--color-orange)' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1.5 min-h-[32px]"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  return (
    <div
      className="relative rounded-xl border p-3 space-y-2 cursor-pointer transition-all"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: hovered ? '#2a3a5c' : 'var(--color-border)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowMove(false) }}
      onClick={openEdit}
    >
      {/* Delete button */}
      {hovered && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors z-10 p-0.5 rounded"
          title="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <p className="text-sm font-medium text-slate-100 pr-5 leading-snug">{task.title}</p>

      {task.notes && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {task.notes}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.badge}`}>
          {catLabel}
        </span>
        {task.assignee && (
          <span className="text-[10px] text-slate-500 font-mono">@{task.assignee}</span>
        )}

        {/* Move dropdown */}
        <div className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMove((p) => !p) }}
            className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded px-1.5 py-0.5 transition-colors flex items-center gap-1 min-h-[24px]"
          >
            Move ▾
          </button>
          {showMove && (
            <div
              className="absolute right-0 bottom-full mb-1 rounded-lg shadow-xl z-20 min-w-[120px] py-1 border"
              style={{ backgroundColor: '#1a2035', borderColor: 'var(--color-border)' }}
            >
              {others.map((s) => (
                <button
                  key={s}
                  onClick={(e) => { e.stopPropagation(); setShowMove(false); onStatusChange(task.id, s) }}
                  className="w-full text-left text-xs px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors min-h-[32px]"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TemplatesModal ──────────────────────────────────────────────────────────

function TemplatesModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (count: number) => void
}) {
  const [selected, setSelected] = useState<TaskTemplate | null>(null)
  const [prefix, setPrefix] = useState('')
  const [categoryOverride, setCategoryOverride] = useState<TaskCategory | ''>('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleCreate = async () => {
    if (!selected || !supabase) return
    setSaving(true)
    const now = Date.now()
    const rows = selected.tasks.map((t, i) => ({
      title: prefix.trim() ? `${prefix.trim()}: ${t.title}` : t.title,
      category: (categoryOverride || t.category) as TaskCategory,
      assignee: t.assignee,
      status: 'planned' as TaskStatus,
      notes: null,
      position: now + i,
    }))
    const { error } = await supabase.from('task_items').insert(rows)
    setSaving(false)
    if (!error) {
      setToast(`✓ ${rows.length} task${rows.length !== 1 ? 's' : ''} added to Planned`)
      setTimeout(() => {
        onCreated(rows.length)
        onClose()
      }, 1200)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,15,30,0.9)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col"
        style={{ backgroundColor: '#0A0F1E', borderColor: '#1E2740', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#1E2740' }}>
          <div>
            <h2 className="text-base font-semibold text-white">Task Templates</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pick a template to bulk-create tasks in Planned</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Template grid */}
          <div className="grid grid-cols-2 gap-3">
            {TASK_TEMPLATES.map((tpl) => {
              const isSelected = selected?.name === tpl.name
              return (
                <button
                  key={tpl.name}
                  onClick={() => setSelected(isSelected ? null : tpl)}
                  className="text-left rounded-xl border p-4 transition-all"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,107,43,0.08)' : '#141929',
                    borderColor: isSelected ? '#FF6B2B' : '#1E2740',
                    outline: 'none',
                  }}
                >
                  <div className="text-2xl mb-2">{tpl.emoji}</div>
                  <div className="text-sm font-semibold text-white mb-1">{tpl.name}</div>
                  <div className="text-xs text-slate-400 leading-relaxed mb-2">{tpl.description}</div>
                  <div
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block"
                    style={{ background: '#1E2740', color: '#94a3b8' }}
                  >
                    {tpl.tasks.length} tasks
                  </div>
                </button>
              )
            })}
          </div>

          {/* Options (shown when template selected) */}
          {selected && (
            <div className="space-y-3 pt-2">
              <div className="h-px" style={{ background: '#1E2740' }} />

              {/* Task preview */}
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Tasks to create</p>
                <ul className="space-y-1">
                  {selected.tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-slate-600 text-xs mt-0.5">→</span>
                      <span className="text-xs text-slate-300">
                        {prefix.trim() ? `${prefix.trim()}: ` : ''}{t.title}
                        <span className="text-slate-600 ml-1">@{t.assignee}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px" style={{ background: '#1E2740' }} />

              {/* Prefix input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Add prefix to task titles (optional)
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g. Searchline Auth"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Category override */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Override category (optional — defaults to template values)
                </label>
                <select
                  value={categoryOverride}
                  onChange={(e) => setCategoryOverride(e.target.value as TaskCategory | '')}
                  className={`${inputCls} cursor-pointer`}
                  style={inputStyle}
                >
                  <option value="">Use template defaults</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t" style={{ borderColor: '#1E2740' }}>
          {toast ? (
            <span className="text-sm text-green-400 font-medium">{toast}</span>
          ) : (
            <>
              <button
                onClick={handleCreate}
                disabled={!selected || saving}
                className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-orange)' }}
              >
                {saving ? 'Creating…' : selected ? `Create ${selected.tasks.length} tasks` : 'Select a template'}
              </button>
              <button
                onClick={onClose}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AddTaskModal ─────────────────────────────────────────────────────────────

const QUICK_ASSIGNEES = ['Sax', 'Nova', 'ANT', 'Echo'] as const

function AddTaskModal({
  onAdd,
  onClose,
}: {
  onAdd: (fields: { title: string; notes: string; assignee: string; category: TaskCategory; status: TaskStatus }) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [assignee, setAssignee] = useState('Sax')
  const [selectedPill, setSelectedPill] = useState<string>('Sax')
  const [category, setCategory] = useState<TaskCategory>('searchline')
  const [status, setStatus] = useState<TaskStatus>('idea')
  const [saving, setSaving] = useState(false)

  const handlePillClick = (name: string) => {
    setSelectedPill(name)
    setAssignee(name)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd({ title: title.trim(), notes: notes.trim(), assignee: assignee.trim() || 'Sax', category, status })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,15,30,0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: '#0A0F1E', borderColor: '#1E2740' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Add Task</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Title *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title…"
              className={inputCls}
              style={inputStyle}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Product / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className={`${inputCls} cursor-pointer`}
                style={inputStyle}
              >
                <option value="searchline">Searchline</option>
                <option value="candidate-portal">Candidate Portal</option>
                <option value="salary-benchmark">Salary Benchmark</option>
                <option value="achievement-record">Achievement Record</option>
                <option value="proofline">Proofline (legacy)</option>
                <option value="second-orbit">Second Orbit</option>
                <option value="openclaw">OpenClaw</option>
                <option value="product-idea">Product Idea</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={`${inputCls} cursor-pointer`}
                style={inputStyle}
              >
                <option value="idea">Ideas</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Assignee</label>
            <div className="flex gap-2 flex-wrap">
              {QUICK_ASSIGNEES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handlePillClick(name)}
                  className="text-xs px-3 py-1 rounded-full border font-medium transition-colors"
                  style={{
                    backgroundColor: selectedPill === name ? 'var(--color-orange)' : 'transparent',
                    borderColor: selectedPill === name ? 'var(--color-orange)' : '#1E2740',
                    color: selectedPill === name ? '#fff' : '#94a3b8',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={assignee}
              onChange={(e) => { setAssignee(e.target.value); setSelectedPill('') }}
              placeholder="Assignee…"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={3}
              className={`${inputCls} resize-none text-xs`}
              style={inputStyle}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-orange)' }}
            >
              {saving ? 'Adding…' : '+ Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({
  status, label, emoji, tasks, onDelete, onStatusChange, onEdit,
}: {
  status: TaskStatus
  label: string
  emoji: string
  tasks: TaskItem[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (id: string, fields: Partial<TaskItem>) => Promise<void>
}) {
  const headerStyle = COLUMN_HEADER_COLOR[status]

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className={`flex items-center gap-2 pb-2 border-b ${headerStyle}`}>
        <span>{emoji}</span>
        <span className="text-sm font-semibold">{label}</span>
        <span
          className="ml-auto text-xs rounded-full px-2 py-0.5"
          style={{ backgroundColor: 'var(--color-card)', color: '#94a3b8' }}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-600 italic text-center py-6">Nothing here yet</p>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── TaskBoard page ───────────────────────────────────────────────────────────

export default function TaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)

  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    if (!supabase) {
      setError('Supabase not configured — set VITE_SUPABASE_ANON_KEY in .env')
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('task_items')
      .select('id, title, notes, status, category, assignee, position, created_at, updated_at')
      .order('position', { ascending: true })
    if (err) {
      setError(err.message)
    } else {
      setTasks((data ?? []) as TaskItem[])
    }
    setLoading(false)
  }

  useEffect(() => { loadTasks() }, [])

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (!supabase) return
    await supabase.from('task_items').delete().eq('id', id)
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    if (!supabase) return
    await supabase.from('task_items').update({ status }).eq('id', id)
  }

  const handleEdit = async (id: string, fields: Partial<TaskItem>) => {
    if (!supabase) return
    const { title, notes, status, category, assignee } = fields
    const { error: err } = await supabase
      .from('task_items')
      .update({ title, notes, status, category, assignee })
      .eq('id', id)
    if (!err) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)))
    }
  }

  const handleAddTask = async (fields: {
    title: string
    notes: string
    assignee: string
    category: TaskCategory
    status: TaskStatus
  }) => {
    if (!supabase) return
    const { data, error: err } = await supabase
      .from('task_items')
      .insert({
        title: fields.title,
        status: fields.status,
        category: fields.category,
        assignee: fields.assignee || 'Sax',
        notes: fields.notes || null,
        position: Date.now(),
      })
      .select()
      .single()
    if (!err && data) {
      setTasks((prev) => [...prev, data as TaskItem])
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-navy)' }}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <svg width="32" height="32" viewBox="150 60 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="225" cy="150" r="50" stroke="url(#tbGrad1)" strokeWidth="4" fill="none" />
                <circle cx="225" cy="150" r="30" fill="url(#tbGrad2)" />
                <circle cx="285" cy="150" r="10" fill="#60A5FA" />
                <line x1="275" y1="150" x2="245" y2="150" stroke="#60A5FA" strokeWidth="2" opacity="0.5" />
                <defs>
                  <linearGradient id="tbGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="tbGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
              </svg>
              <h1 className="text-2xl font-bold text-white">Second Orbit</h1>
            </div>
            <p className="text-sm text-slate-500 ml-11">Mission Control — Task Board</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              📋 Templates
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-medium text-white px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-orange)' }}
            >
              + Add Task
            </button>
            <button
              onClick={loadTasks}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
            <span className="text-sm">Loading tasks…</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={loadTasks} className="text-xs text-slate-300 border border-slate-600 px-4 py-2 rounded-lg hover:border-slate-400 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {COLUMNS.map(({ status, label, emoji }) => (
              <KanbanColumn
                key={status}
                status={status}
                label={label}
                emoji={emoji}
                tasks={tasks.filter((t) => t.status === status)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {showTemplatesModal && (
          <TemplatesModal
            onClose={() => setShowTemplatesModal(false)}
            onCreated={async (_count) => {
              await loadTasks()
            }}
          />
        )}

        {showAddModal && (
          <AddTaskModal
            onAdd={async (fields) => {
              await handleAddTask(fields)
              await loadTasks()
            }}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  )
}
