import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { Home } from './pages/Home'
import TaskBoard from './pages/TaskBoard'
import Automation from './pages/Automation'
import AIFramework from './pages/AIFramework'
import MarketingStrategy from './pages/MarketingStrategy'
import Radar from './pages/Radar'

const SESSION_KEY = 'so_auth'
const CORRECT = 'Boxing77Boom'

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (authed) return <>{children}</>

  const attempt = () => {
    if (input === CORRECT) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        <div>
          <img src="/second-orbit-logo.svg" alt="Second Orbit" style={{ height: 28, marginBottom: 16 }} />
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Enter password to continue</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="password"
            value={input}
            autoFocus
            placeholder="Password"
            onChange={e => { setInput(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            style={{
              background: '#020617',
              border: `1px solid ${error ? '#ef4444' : '#1e293b'}`,
              borderRadius: 8,
              color: '#f8fafc',
              fontSize: 15,
              padding: '10px 14px',
              outline: 'none',
            }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>Incorrect password</p>}
        </div>

        <button
          onClick={attempt}
          style={{
            background: '#f97316',
            color: '#020617',
            border: 'none',
            borderRadius: 8,
            padding: '11px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/ai-framework" element={<AIFramework />} />
        <Route path="/marketing-strategy" element={<MarketingStrategy />} />
        <Route path="/radar" element={<Radar />} />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  )
}
