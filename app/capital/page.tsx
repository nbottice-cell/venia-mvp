'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'raise' | 'invest'
type StageFilter = 'All' | 'Pre-seed' | 'Seed' | 'Series A'

type Raise = {
  id: string
  name: string
  pitch: string
  stage: string
  ask: string
  equity: string
  use: string
  sector: string
  founder: string
  location: string
  traction: string
  verified?: boolean
  media?: { pitchDeck?: string, images?: string[], videoUrl?: string }
}

const EXAMPLE_RAISES: Raise[] = [
  {
    id: 'r1',
    name: 'EchoAI',
    pitch: 'AI that joins your calls, takes perfect notes, assigns action items, and sends follow-ups automatically.',
    stage: 'Seed',
    ask: '$250,000',
    equity: '10%',
    use: 'Product development and first 3 enterprise sales hires.',
    sector: 'B2B SaaS',
    founder: 'Marcus T.',
    location: 'San Francisco, CA',
    traction: '12 beta customers · $8k MRR',
    verified: true,
    media: { pitchDeck: 'EchoAI_Seed_Deck_2026.pdf', images: ['product-demo.png', 'team.jpg'], videoUrl: 'https://youtube.com/watch?v=demo' },
  },
  {
    id: 'r2',
    name: 'SipStill',
    pitch: 'A smart coffee system that adapts your brew strength to your sleep quality and stress levels from Apple Health.',
    stage: 'Pre-seed',
    ask: '$150,000',
    equity: '15%',
    use: 'Hardware prototyping and regulatory compliance review.',
    sector: 'Consumer Hardware',
    founder: 'Priya K.',
    location: 'Austin, TX',
    traction: 'Working prototype · 400 waitlist signups',
    verified: true,
    media: { pitchDeck: 'SipStill_Pitch_Deck.pdf', images: ['prototype-photo.jpg'] },
  },
  {
    id: 'r3',
    name: 'GrowLocal',
    pitch: 'A hyper-local marketplace connecting home gardeners with neighbors who want fresh produce.',
    stage: 'Pre-seed',
    ask: '$100,000',
    equity: '20%',
    use: 'App development and launch in 3 pilot cities.',
    sector: 'Marketplace',
    founder: 'James R.',
    location: 'Portland, OR',
    traction: '200 gardeners in beta · $2k GMV/month',
    verified: false,
    media: { videoUrl: 'https://youtube.com/watch?v=demo2' },
  },
  {
    id: 'r4',
    name: 'SkillBridge',
    pitch: 'A peer-to-peer skill exchange where expertise is the currency — teach what you know, learn what you need.',
    stage: 'Seed',
    ask: '$200,000',
    equity: '12%',
    use: 'Platform scaling, trust and safety, and community growth.',
    sector: 'EdTech',
    founder: 'Aisha M.',
    location: 'New York, NY',
    traction: '1,200 members · 340 exchanges completed',
    verified: true,
    media: { pitchDeck: 'SkillBridge_Deck_v3.pdf', images: ['dashboard.png', 'mobile-app.png', 'metrics.png'] },
  },
  {
    id: 'r5',
    name: 'Favilla',
    pitch: 'A dating app built around real-world check-ins — match with people at the same venue right now.',
    stage: 'Pre-seed',
    ask: '$180,000',
    equity: '18%',
    use: 'Venue partnership team and iOS/Android public launch.',
    sector: 'Social / Consumer',
    founder: 'Chris B.',
    location: 'Miami, FL',
    traction: '2,400 beta users across 5 Miami venues',
    verified: false,
    media: { pitchDeck: 'Favilla_Investor_Brief.pdf', videoUrl: 'https://youtube.com/watch?v=demo3' },
  },
]

const STAGE_COLORS: Record<string, { bg: string, border: string, text: string }> = {
  'Pre-seed': { bg: 'rgba(201,168,76,0.10)', border: 'rgba(201,168,76,0.25)', text: '#C9A84C' },
  'Seed':     { bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)', text: '#A78BFA' },
  'Series A': { bg: 'rgba(45,212,191,0.10)', border: 'rgba(45,212,191,0.25)', text: '#2DD4BF' },
}

export default function CapitalPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('raise')
  const [stageFilter, setStageFilter] = useState<StageFilter>('All')
  const [detailRaise, setDetailRaise] = useState<Raise | null>(null)
  const [interestDone, setInterestDone] = useState(false)

  // Post a raise modal
  const [showPost, setShowPost] = useState(false)
  const [postDone, setPostDone] = useState(false)
  const [postName, setPostName] = useState('')
  const [postPitch, setPostPitch] = useState('')
  const [postAsk, setPostAsk] = useState('')
  const [postEquity, setPostEquity] = useState('')
  const [postUse, setPostUse] = useState('')
  const [postStage, setPostStage] = useState('')
  // Media state
  const [postPitchDeck, setPostPitchDeck] = useState<string | null>(null)
  const [postImages, setPostImages] = useState<string[]>([])
  const [postVideoUrl, setPostVideoUrl] = useState('')

  const filtered = stageFilter === 'All'
    ? EXAMPLE_RAISES
    : EXAMPLE_RAISES.filter(r => r.stage === stageFilter)

  // ── STYLES ──
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 13px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 24px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '11px 20px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }

  function RaiseCard({ raise, investorView }: { raise: Raise, investorView?: boolean }) {
    const stageColor = STAGE_COLORS[raise.stage] || STAGE_COLORS['Pre-seed']
    return (
      <div
        style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', cursor: 'pointer', transition: 'border-color 0.2s' }}
        onClick={() => { setDetailRaise(raise); setInterestDone(false) }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)')}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: '#EEE8D8' }}>{raise.name}</div>
            {raise.verified && <span title="Identity Verified" style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)', color: '#4ADE80', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', flexShrink: 0 }}>✓ Verified</span>}
          </div>
          <div style={{ background: stageColor.bg, border: `1px solid ${stageColor.border}`, color: stageColor.text, fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: '4px', flexShrink: 0 }}>{raise.stage}</div>
          <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: '4px', flexShrink: 0 }}>{raise.sector}</div>
        </div>
        <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '14px' }}>{raise.pitch}</p>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.5)', marginBottom: '3px' }}>Raising</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#4ADE80', fontFamily: "'JetBrains Mono', monospace" }}>{raise.ask}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.5)', marginBottom: '3px' }}>Equity</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#C9A84C', fontFamily: "'JetBrains Mono', monospace" }}>{raise.equity}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.5)', marginBottom: '3px' }}>{investorView ? 'Founder' : 'Location'}</div>
            <div style={{ fontSize: '12px', color: '#C8C4B4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{investorView ? raise.founder : raise.location}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.06em' }}>{raise.traction}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.4)' }}>View details →</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky' as const, top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>Capital</div>
        <button onClick={() => router.push('/verify')} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ADE80', padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✓ Get Verified</button>
        {tab === 'raise' && (
          <button onClick={() => { setShowPost(true); setPostDone(false) }} style={{ ...goldBtn, padding: '7px 16px', fontSize: '12px' }}>+ Post Your Raise</button>
        )}
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(201,168,76,0.06) 100%)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '16px', padding: '28px 32px', marginBottom: '24px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#4ADE80', marginBottom: '8px' }}>◆ Venia Capital</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Where founders meet <em style={{ fontStyle: 'italic', color: '#4ADE80' }}>believers.</em>
          </h1>
          <p style={{ color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', marginBottom: '12px' }}>
            Post your funding round or find ideas worth backing. Capital matching is coming soon — for now, express your interest and we will connect you directly.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '5px 12px' }}>
            <span style={{ color: '#C9A84C', fontSize: '10px' }}>◈</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }}>Transactions coming soon · Expressions of interest only</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          {([
            { id: 'raise', label: 'Raise Capital', icon: '🚀' },
            { id: 'invest', label: 'Invest', icon: '💼' },
          ] as { id: Tab, label: string, icon: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: tab === t.id ? 'linear-gradient(135deg, #C9A84C, #E2C06A)' : 'transparent', color: tab === t.id ? '#111923' : 'rgba(238,232,216,0.5)', boxShadow: tab === t.id ? '0 2px 8px rgba(201,168,76,0.25)' : 'none' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── RAISE TAB ── */}
        {tab === 'raise' && (
          <>
            <div style={{ background: 'rgba(24,34,46,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px 22px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as const }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#EEE8D8', marginBottom: '4px' }}>Ready to raise?</div>
                <div style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.5' }}>Post your round in under 2 minutes. Investors and believers on Venia will be notified.</div>
              </div>
              <button onClick={() => { setShowPost(true); setPostDone(false) }} style={{ ...goldBtn, flexShrink: 0 }}>Post Your Round →</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {EXAMPLE_RAISES.map(raise => <RaiseCard key={raise.id} raise={raise} />)}
            </div>
          </>
        )}

        {/* ── INVEST TAB ── */}
        {tab === 'invest' && (
          <>
            <div style={{ background: 'rgba(24,34,46,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px 22px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#EEE8D8', marginBottom: '4px' }}>Browse active rounds</div>
              <div style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.5' }}>Express your interest and we will connect you with the founder directly. No accreditation required to browse.</div>
            </div>

            {/* Stage filter */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
              {(['All', 'Pre-seed', 'Seed', 'Series A'] as StageFilter[]).map(s => (
                <button key={s} onClick={() => setStageFilter(s)}
                  style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${stageFilter === s ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`, background: stageFilter === s ? 'rgba(74,222,128,0.12)' : 'transparent', color: stageFilter === s ? '#4ADE80' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '11px', fontWeight: stageFilter === s ? '600' : '400', cursor: 'pointer' }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map(raise => <RaiseCard key={raise.id} raise={raise} investorView />)}
            </div>
          </>
        )}
      </div>

      {/* ── DETAIL SHEET ── */}
      {detailRaise && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setDetailRaise(null)}>
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px 20px 0 0', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -8px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '14px', paddingBottom: '4px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)' }} />
            </div>
            <div style={{ padding: '20px 28px 36px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600', color: '#EEE8D8', marginBottom: '6px' }}>{detailRaise.name}</div>
                  <p style={{ fontSize: '14px', color: '#8E8B7A', lineHeight: '1.65', margin: 0 }}>{detailRaise.pitch}</p>
                </div>
                <div style={{ background: (STAGE_COLORS[detailRaise.stage] || STAGE_COLORS['Pre-seed']).bg, border: `1px solid ${(STAGE_COLORS[detailRaise.stage] || STAGE_COLORS['Pre-seed']).border}`, color: (STAGE_COLORS[detailRaise.stage] || STAGE_COLORS['Pre-seed']).text, fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '4px 10px', borderRadius: '4px', flexShrink: 0, marginTop: '4px' }}>{detailRaise.stage}</div>
              </div>

              <div style={{ height: '1px', background: 'rgba(201,168,76,0.1)', margin: '20px 0' }} />

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Raising', value: detailRaise.ask, color: '#4ADE80' },
                  { label: 'Equity offered', value: detailRaise.equity, color: '#C9A84C' },
                  { label: 'Sector', value: detailRaise.sector, color: '#A78BFA' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.5)', marginBottom: '6px' }}>{stat.label}</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Detail sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Use of funds', value: detailRaise.use, icon: '◈' },
                  { label: 'Traction', value: detailRaise.traction, icon: '◉' },
                  { label: 'Founder', value: `${detailRaise.founder} · ${detailRaise.location}`, icon: '◎' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                      <span style={{ color: '#C9A84C', fontSize: '11px' }}>{s.icon}</span>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }}>{s.label}</div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#C5BBA8', lineHeight: '1.7', margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(201,168,76,0.1)', marginBottom: '20px' }} />

              {/* Media */}
              {detailRaise.media && (Object.keys(detailRaise.media).some(k => detailRaise.media![k as keyof typeof detailRaise.media])) && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)', marginBottom: '12px' }}>◈ Media & Materials</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                    {detailRaise.media.pitchDeck && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '16px' }}>📄</span>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#EEE8D8' }}>{detailRaise.media.pitchDeck}</div>
                          <div style={{ fontSize: '10px', color: '#8E8B7A' }}>Pitch Deck</div>
                        </div>
                      </div>
                    )}
                    {detailRaise.media.videoUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(224,123,138,0.08)', border: '1px solid rgba(224,123,138,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '16px' }}>▶</span>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#EEE8D8' }}>Demo Video</div>
                          <div style={{ fontSize: '10px', color: '#8E8B7A' }}>YouTube / Vimeo</div>
                        </div>
                      </div>
                    )}
                    {detailRaise.media.images?.map((img, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '16px' }}>🖼</span>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#EEE8D8' }}>{img}</div>
                          <div style={{ fontSize: '10px', color: '#8E8B7A' }}>Image</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coming soon notice */}
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '4px' }}>Coming Soon</div>
                <p style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.55', margin: 0 }}>Direct investment processing is not yet live. Expressing interest notifies the founder and reserves your place when the round opens formally.</p>
              </div>

              {!interestDone ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setDetailRaise(null)} style={ghostBtn}>✕ Close</button>
                  <button
                    onClick={() => setInterestDone(true)}
                    style={{ ...goldBtn, flex: 1, background: 'linear-gradient(135deg, #4ADE80, #2DD4BF)', color: '#111923' }}>
                    💼 Express Interest in {detailRaise.name}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#EEE8D8', marginBottom: '8px' }}>Interest noted.</div>
                  <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '20px' }}>
                    The founder of <strong style={{ color: '#4ADE80' }}>{detailRaise.name}</strong> has been notified. We will reach out when the round is ready to close.
                  </p>
                  <button onClick={() => setDetailRaise(null)} style={{ ...goldBtn }}>Back to Capital →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── POST A RAISE MODAL ── */}
      {showPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowPost(false)}>
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            {!postDone ? (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#4ADE80', marginBottom: '6px' }}>◆ Post Your Raise</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#EEE8D8', marginBottom: '4px' }}>Tell investors about your round.</div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6', marginBottom: '24px' }}>Your listing will appear in the Capital feed. Interested investors can express interest and we will connect you directly.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Company or idea name *</label>
                    <input value={postName} onChange={e => setPostName(e.target.value)} placeholder="What are you building?" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>One-line pitch *</label>
                    <input value={postPitch} onChange={e => setPostPitch(e.target.value)} placeholder="What does it do and who is it for?" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Amount raising *</label>
                      <input value={postAsk} onChange={e => setPostAsk(e.target.value)} placeholder="e.g. $250,000" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Equity offered</label>
                      <input value={postEquity} onChange={e => setPostEquity(e.target.value)} placeholder="e.g. 10%" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Stage</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                      {['Pre-seed', 'Seed', 'Series A'].map(s => (
                        <button key={s} type="button" onClick={() => setPostStage(s)}
                          style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${postStage === s ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, background: postStage === s ? 'rgba(201,168,76,0.12)' : 'transparent', color: postStage === s ? '#C9A84C' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Use of funds</label>
                    <textarea value={postUse} onChange={e => setPostUse(e.target.value)} placeholder="What will you use the money for?" rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                  </div>

                  {/* Media uploads */}
                  <div>
                    <label style={labelStyle}>Media & Materials <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Pitch Deck */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: postPitchDeck ? 'rgba(201,168,76,0.08)' : 'rgba(17,25,35,0.6)', border: `1px solid ${postPitchDeck ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: postPitchDeck ? '#C9A84C' : '#8E8B7A' }}>{postPitchDeck || 'Upload Pitch Deck'}</div>
                          <div style={{ fontSize: '11px', color: '#4A4838' }}>PDF · Max 20MB</div>
                        </div>
                        {postPitchDeck && <button type="button" onClick={e => { e.preventDefault(); setPostPitchDeck(null) }} style={{ background: 'none', border: 'none', color: '#8E8B7A', cursor: 'pointer', fontSize: '14px', padding: '0' }}>✕</button>}
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setPostPitchDeck(e.target.files[0].name) }} />
                      </label>

                      {/* Images */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: postImages.length > 0 ? 'rgba(167,139,250,0.08)' : 'rgba(17,25,35,0.6)', border: `1px solid ${postImages.length > 0 ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: '20px' }}>🖼</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: postImages.length > 0 ? '#A78BFA' : '#8E8B7A' }}>{postImages.length > 0 ? `${postImages.length} image${postImages.length > 1 ? 's' : ''} selected` : 'Upload Product Images'}</div>
                          <div style={{ fontSize: '11px', color: '#4A4838' }}>JPG, PNG · Up to 5 files</div>
                        </div>
                        {postImages.length > 0 && <button type="button" onClick={e => { e.preventDefault(); setPostImages([]) }} style={{ background: 'none', border: 'none', color: '#8E8B7A', cursor: 'pointer', fontSize: '14px', padding: '0' }}>✕</button>}
                        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) setPostImages(Array.from(e.target.files).map(f => f.name)) }} />
                      </label>

                      {/* Video link */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px' }}>
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>▶</span>
                        <input
                          type="url"
                          value={postVideoUrl}
                          onChange={e => setPostVideoUrl(e.target.value)}
                          placeholder="Paste YouTube or Vimeo link"
                          style={{ background: 'none', border: 'none', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '4px' }}>Coming Soon</div>
                  <p style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.55', margin: 0 }}>Live capital matching and transaction processing are in development. Submitting now puts you in the queue and lets interested investors find you today.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowPost(false)} style={ghostBtn}>Cancel</button>
                  <button
                    onClick={() => setPostDone(true)}
                    disabled={!postName.trim() || !postPitch.trim() || !postAsk.trim()}
                    style={{ ...goldBtn, flex: 1, opacity: postName.trim() && postPitch.trim() && postAsk.trim() ? 1 : 0.4 }}>
                    Submit Listing →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>✦</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: '10px' }}>Your raise is live.</div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '24px' }}>
                  <strong style={{ color: '#4ADE80' }}>{postName}</strong> is now visible to investors on Venia. We will notify you when someone expresses interest.
                </p>
                <button onClick={() => setShowPost(false)} style={{ ...goldBtn, padding: '12px 28px' }}>Back to Capital →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
