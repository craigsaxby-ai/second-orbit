import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'idea' | 'planned' | 'in_progress' | 'done'
type TaskCategory = 'searchline' | 'openclaw' | 'product-idea' | 'infrastructure'

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
  'searchline':     { badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',   dot: 'bg-blue-400' },
  'openclaw':       { badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', dot: 'bg-purple-400' },
  'product-idea':   { badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', dot: 'bg-orange-400' },
  'infrastructure': { badge: 'bg-green-500/20 text-green-300 border border-green-500/30',  dot: 'bg-green-400' },
}

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  'searchline':     'Searchline',
  'openclaw':       'OpenClaw',
  'product-idea':   'Product Ideas',
  'infrastructure': 'Infrastructure',
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onDelete,
  onStatusChange,
}: {
  task: TaskItem
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [showMove, setShowMove] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const cat = CATEGORY_STYLES[task.category] ?? { badge: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', dot: 'bg-gray-400' }
  const catLabel = CATEGORY_LABELS[task.category] ?? task.category
  const others = (Object.keys(STATUS_LABELS) as TaskStatus[]).filter((s) => s !== task.status)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Delete this task?')) onDelete(task.id)
  }

  return (
    <div
      className="relative rounded-xl border p-3 space-y-2 cursor-pointer transition-all"
      style={{ backgroundColor: 'var(--color-card)', borderColor: hovered ? '#2a3a5c' : 'var(--color-border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowMove(false) }}
      onClick={() => setExpanded((p) => !p)}
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
        <p className={`text-xs text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
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
            className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded px-1.5 py-0.5 transition-colors flex items-center gap-1"
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
                  className="w-full text-left text-xs px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
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

// ─── InlineAddTask ────────────────────────────────────────────────────────────

function InlineAddTask({
  status,
  onAdd,
}: {
  status: TaskStatus
  onAdd: (title: string, status: TaskStatus) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd(title.trim(), status)
      setTitle('')
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 w-full py-1 px-1 rounded transition-colors hover:bg-white/5"
      >
        <span className="text-base leading-none">+</span> Add task
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-2.5 rounded-xl border"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
        className="text-sm bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-600 w-full"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="text-xs px-3 py-1 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-orange)' }}
        >
          {saving ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitle('') }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({
  status, label, emoji, tasks, onDelete, onStatusChange, onAddTask,
}: {
  status: TaskStatus
  label: string
  emoji: string
  tasks: TaskItem[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onAddTask: (title: string, status: TaskStatus) => Promise<void>
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

      <InlineAddTask status={status} onAdd={onAddTask} />

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

  const handleAddTask = async (title: string, status: TaskStatus) => {
    if (!supabase) return
    const { data, error: err } = await supabase
      .from('task_items')
      .insert({
        title,
        status,
        category: 'searchline',
        assignee: 'Sax',
        notes: '',
        position: 0,
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: 'var(--color-orange)' }}>
                SO
              </div>
              <h1 className="text-2xl font-bold text-white">Second Orbit</h1>
            </div>
            <p className="text-sm text-slate-500 ml-11">Mission Control — Task Board</p>
          </div>
          <button
            onClick={loadTasks}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            ↻ Refresh
          </button>
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
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
