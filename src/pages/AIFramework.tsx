// ─── Second Orbit AI Operating Framework ─────────────────────────────────────

import { Link } from 'react-router-dom'

// ─── Nav (shared style) ───────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid #1e293b',
        background: '#020617',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <img src="/second-orbit-logo.svg" alt="Second Orbit" style={{ height: 32, width: 'auto' }} />
      <div style={{ display: 'flex', gap: 24 }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Home</Link>
        <Link to="/tasks" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Tasks</Link>
        <Link to="/automation" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>⚙️ Automation</Link>
        <Link to="/ai-framework" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>🧠 AI Framework</Link>
      </div>
    </nav>
  )
}

// ─── Agent card ───────────────────────────────────────────────────────────────

interface AgentCardProps {
  emoji: string
  name: string
  role: string
  model: string
  modelAlt?: string
  use: string[]
  rule: string
  accentColor: string
}

function AgentCard({ emoji, name, role, model, modelAlt, use, rule, accentColor }: AgentCardProps) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: `1px solid #1e293b`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 12,
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
        <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 18 }}>{name}</div>
        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500, marginTop: 2 }}>{role}</div>
      </div>

      {/* Model badge(s) */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          background: '#1e293b',
          color: accentColor,
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.03em',
        }}>{model}</span>
        {modelAlt && (
          <span style={{
            background: '#1e293b',
            color: '#94a3b8',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}>{modelAlt} (admin)</span>
        )}
      </div>

      {/* Use cases */}
      <div>
        <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Use for
        </div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>
          {use.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      {/* Rule */}
      <div style={{
        background: '#1e293b',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: '0 6px 6px 0',
        padding: '10px 14px',
        color: '#e2e8f0',
        fontSize: 13,
        fontStyle: 'italic',
      }}>
        {rule}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIFramework() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'system-ui, sans-serif' }}>
      <Nav />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ width: 48, height: 3, background: '#f97316', borderRadius: 2, marginBottom: 24 }} />
          <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 800, margin: '0 0 12px' }}>
            🧠 AI Operating Framework
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
            Second Orbit runs as a coordinated AI system. Each agent has a clear role, model, and cost tier.
            Strong models are used only where they add real value.
          </p>
        </div>

        {/* Agents */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Agents
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            <AgentCard
              emoji="🧠"
              name="Nova"
              role="Strategy, Brain & Orchestrator"
              model="Claude Sonnet 4.6"
              modelAlt="Claude Haiku"
              accentColor="#f97316"
              use={[
                'Product strategy & architecture',
                'Searchline roadmap planning',
                'Breaking tasks into build specs',
                'Reviewing ANT\'s work',
                'Deciding what to build',
                'Managing priorities across products',
              ]}
              rule="Sonnet when the decision matters. Haiku when it's admin, summary, or low-risk."
            />
            <AgentCard
              emoji="🔨"
              name="ANT"
              role="Builder & Coding Agent"
              model="GPT-5.1 Codex"
              accentColor="#60a5fa"
              use={[
                'Building Searchline features',
                'Fixing bugs & refactoring',
                'Implementing UI changes',
                'Connecting frontend & backend',
                'Running tests',
                'Following Nova\'s specs',
              ]}
              rule="Nova decides what and why. ANT builds how."
            />
            <AgentCard
              emoji="⚡"
              name="Echo"
              role="Fast, Cheap Research & Support"
              model="Gemini Flash"
              accentColor="#a78bfa"
              use={[
                'Summarising notes & transcripts',
                'Parsing & extracting key points',
                'Organising rough information',
                'Drafting simple lists',
                'Preparing background research',
                'Marketing & admin support',
              ]}
              rule="Use Echo when the work is repetitive, factual, or low-risk."
            />
          </div>
        </section>

        {/* Ideal flow */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Ideal Workflow
          </h2>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: '1', label: 'Craig gives the goal to Nova', color: '#f97316' },
              { step: '2', label: 'Nova thinks, plans and breaks the work into tasks', color: '#f97316' },
              { step: '3', label: 'Nova sends build work to ANT', color: '#60a5fa' },
              { step: '4', label: 'Echo handles research, summaries and low-cost support', color: '#a78bfa' },
              { step: '5', label: 'Nova reviews key outputs before decisions are made', color: '#f97316' },
            ].map(({ step, label, color }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: color, color: '#020617',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  {step}
                </div>
                <span style={{ color: '#cbd5e1', fontSize: 15 }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cost control */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Cost Control Rule
          </h2>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '28px' }}>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
              Default to the <strong style={{ color: '#f8fafc' }}>cheapest capable model</strong>. Use expensive thinking only when the task affects:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {[
                'Product direction',
                'Architecture',
                'Searchline build decisions',
                'Security & auth',
                'Database design',
                'Legal / compliance',
                'Customer-facing output',
                'Specs ANT needs to build from',
              ].map(item => (
                <div key={item} style={{
                  background: '#1e293b',
                  borderRadius: 6,
                  padding: '8px 14px',
                  color: '#f97316',
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  ⚠️ {item}
                </div>
              ))}
            </div>
            <p style={{ color: '#64748b', fontSize: 13, margin: '20px 0 0', lineHeight: 1.6 }}>
              Everything else → Haiku or Echo first.
            </p>
          </div>
        </section>

        {/* Deviation notice */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            background: '#1c0a00',
            border: '1px solid #7c2d12',
            borderRadius: 12,
            padding: '24px 28px',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🚨</span>
            <div>
              <div style={{ color: '#fb923c', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Deviation Rule</div>
              <p style={{ color: '#fed7aa', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                If Nova ever uses a model or agent outside this framework, she must immediately inform Sax —
                what was used, what should have been used, and why. <strong>No silent deviations. Ever.</strong>
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
