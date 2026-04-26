'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'

const CATEGORIES = [
  {
    id: 'engineers',
    icon: '💻',
    label: 'Engineers',
    desc: 'Software, hardware, and mechanical engineers ready to build.',
    count: '140+',
    color: '#2DD4BF',
    dim: 'rgba(45,212,191,0.08)',
    border: 'rgba(45,212,191,0.25)',
  },
  {
    id: 'designers',
    icon: '🎨',
    label: 'Designers',
    desc: 'Product, UX, and brand designers who turn concepts into experiences.',
    count: '80+',
    color: '#E07B8A',
    dim: 'rgba(224,123,138,0.08)',
    border: 'rgba(224,123,138,0.25)',
  },
  {
    id: 'manufacturers',
    icon: '🏭',
    label: 'Manufacturers',
    desc: 'Domestic and overseas manufacturing partners for physical products.',
    count: '60+',
    color: '#C9A84C',
    dim: 'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.25)',
  },
  {
    id: 'marketers',
    icon: '📢',
    label: 'Marketers',
    desc: 'Growth, content, and paid acquisition specialists for early-stage ideas.',
    count: '95+',
    color: '#A78BFA',
    dim: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
  },
  {
    id: 'lawyers',
    icon: '⚖️',
    label: 'Lawyers',
    desc: 'IP, startup, and corporate attorneys who understand founders.',
    count: '45+',
    color: '#94A3B8',
    dim: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.25)',
  },
  {
    id: 'investors',
    icon: '💰',
    label: 'Angel Investors',
    desc: 'Early-stage angels and micro-VCs actively looking for their next bet.',
    count: '70+',
    color: '#4ADE80',
    dim: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
  },
  {
    id: 'team',
    icon: '🤝',
    label: 'Team Members',
    desc: 'Talented people open to co-founding or joining an early-stage team.',
    count: '200+',
    color: '#F59E0B',
    dim: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    id: 'corporations',
    icon: '🏢',
    label: 'Corporations',
    desc: 'Companies actively searching to license and acquire innovative ideas.',
    count: '30+',
    color: '#60A5FA',
    dim: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.25)',
  },
]

export default function ConnectPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>Connect</div>
        <button
          onClick={() => router.push('/connect/list-yourself')}
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', color: '#C9A84C', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          + List Yourself
        </button>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '52px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '14px' }}>◈ Venia Connect</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '14px' }}>
            Find the people who will<br />
            <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>make it real.</em>
          </h1>
          <p style={{ color: '#8E8B7A', fontSize: '15px', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto' }}>
            Browse verified professionals, co-founders, and partners ready to work on ideas like yours.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {CATEGORIES.map(cat => (
            <CategoryCard key={cat.id} cat={cat} onClick={() => router.push(`/connect/${cat.id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ cat, onClick }: { cat: typeof CATEGORIES[0], onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'rgba(24,34,46,0.75)', border: '1px solid rgba(201,168,76,0.10)', borderRadius: '18px', padding: '28px 24px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s ease', backdropFilter: 'blur(10px)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
      onMouseEnter={e => { e.currentTarget.style.background = cat.dim; e.currentTarget.style.borderColor = cat.border; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(24,34,46,0.75)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)' }}
    >
      <div style={{ fontSize: '34px', marginBottom: '16px', lineHeight: 1 }}>{cat.icon}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: '600', color: '#EEE8D8' }}>{cat.label}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: cat.color, background: cat.dim, border: `1px solid ${cat.border}`, padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>{cat.count}</div>
      </div>
      <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '18px' }}>{cat.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: cat.color }}>
        <span>Browse {cat.label}</span>
        <span>→</span>
      </div>
    </button>
  )
}
