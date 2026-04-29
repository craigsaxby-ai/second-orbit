import { Link } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = 'Live' | 'Beta' | 'Building'

interface Product {
  name: string
  description: string
  status: ProductStatus
  url: string
  stat: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    name: 'Searchline',
    description: 'AI hiring platform. Brief Erica, get a pre-screened shortlist.',
    status: 'Live',
    url: 'https://interview-engine-searchline.vercel.app',
    stat: 'End-to-end hiring automation',
  },
  {
    name: 'Candidate Portal',
    description: 'Career matching for candidates. Talk to Erica, get matched.',
    status: 'Live',
    url: 'https://candidate-portal-taupe.vercel.app',
    stat: 'Career coaching + job matching',
  },
  {
    name: 'Salary Benchmark',
    description: 'Free salary checker for B2B sales leaders.',
    status: 'Live',
    url: 'https://salary-benchmark-dun.vercel.app',
    stat: 'Email lead capture',
  },
  {
    name: 'Achievement Record',
    description: 'Personal career vault. Track wins, courses, books.',
    status: 'Beta',
    url: 'https://proofline-bice.vercel.app',
    stat: 'Career evidence management',
  },
]

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ProductStatus, string> = {
  Live:     'background:#16a34a; color:#dcfce7;',
  Beta:     'background:#ea580c; color:#fff7ed;',
  Building: 'background:#475569; color:#e2e8f0;',
}

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      style={{
        ...Object.fromEntries(
          STATUS_STYLES[status].split(';').filter(Boolean).map(s => {
            const [k, v] = s.split(':')
            return [k.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()), v.trim()]
          })
        ),
        padding: '2px 10px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
      }}
    >
      {status}
    </span>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#f97316')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#1e293b')}
    >
      {/* Name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 18 }}>{product.name}</span>
        <StatusBadge status={product.status} />
      </div>

      {/* Description */}
      <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
        {product.description}
      </p>

      {/* Stat */}
      <div
        style={{
          background: '#1e293b',
          borderRadius: 6,
          padding: '6px 12px',
          color: '#f97316',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.03em',
          alignSelf: 'flex-start',
        }}
      >
        {product.stat}
      </div>

      {/* URL */}
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#60a5fa',
          fontSize: 13,
          textDecoration: 'none',
          wordBreak: 'break-all',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline')}
        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none')}
      >
        {product.url} ↗
      </a>
    </div>
  )
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
        borderBottom: '1px solid #1e293b',
        background: '#020617',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <span style={{ color: '#f97316', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
        Second Orbit
      </span>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link
          to="/"
          style={{ color: '#f8fafc', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
        >
          Home
        </Link>
        <Link
          to="/tasks"
          style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
        >
          Tasks
        </Link>
      </div>
    </nav>
  )
}

// ─── Home page ────────────────────────────────────────────────────────────────

export function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'system-ui, sans-serif' }}>
      <Nav />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 3,
              background: '#f97316',
              borderRadius: 2,
              margin: '0 auto 24px',
            }}
          />
          <h1
            style={{
              color: '#f8fafc',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 12px',
              lineHeight: 1.1,
            }}
          >
            Second Orbit
          </h1>
          <p style={{ color: '#64748b', fontSize: 18, margin: 0 }}>
            Building AI-powered products
          </p>
        </div>

        {/* Products */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              color: '#f8fafc',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Products
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {PRODUCTS.map(p => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h2
            style={{
              color: '#f8fafc',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Quick Links
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/tasks"
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                padding: '10px 20px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid #334155',
              }}
            >
              View Task Board →
            </Link>
            <a
              href="https://interview-engine-searchline.vercel.app/analytics"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#1e293b',
                color: '#f97316',
                padding: '10px 20px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid #334155',
              }}
            >
              Searchline Analytics →
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
