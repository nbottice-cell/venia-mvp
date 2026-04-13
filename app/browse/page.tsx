'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const IDEAS = [
  { id: '1', emoji: '🤖', name: 'EchoAI', tagline: 'Meetings That Remember', desc: 'AI joins your calls, takes perfect notes, assigns action items, and sends follow-ups automatically. Built for remote teams.', founder: 'Maya K.', location: 'San Francisco, CA', raised: 120000, goal: 250000, backers: 847, daysLeft: 12, category: 'AI & Tech', color: '#A99BFF', colorDim: 'rgba(124,109,250,0.12)', mode: 'Build' },
  { id: '2', emoji: '☕', name: 'SipStill', tagline: 'Health-Adaptive Brewing', desc: 'Smart coffee bottle that adapts your brew to your HRV, sleep quality, and stress levels via Apple Health. Patent pending.', founder: 'Botts', location: 'South Bend, IN', raised: 156000, goal: 300000, backers: 934, daysLeft: 19, category: 'Hardware', color: '#2DD4BF', colorDim: 'rgba(45,212,191,0.10)', mode: 'Build' },
  { id: '3', emoji: '🔥', name: 'Favilla', tagline: 'Spark in Real Life', desc: 'Dating app built around real-world venue check-ins. Match with people at the same bar or coffee shop right now.', founder: 'Botts', location: 'South Bend, IN', raised: 34000, goal: 100000, backers: 211, daysLeft: 45, category: 'Social', color: '#E07B8A', colorDim: 'rgba(224,123,138,0.10)', mode: 'Build' },
  { id: '4', emoji: '🧠', name: 'MindOS', tagline: 'Your Second Brain', desc: 'Personal AI that learns how you think. Reads your notes and emails to answer questions exactly how you would.', founder: 'Alex L.', location: 'New York, NY', raised: 89000, goal: 200000, backers: 623, daysLeft: 8, category: 'AI & Tech', color: '#C9A84C', colorDim: 'rgba(201,168,76,0.10)', mode: 'Build' },
  { id: '5', emoji: '🌱', name: 'GrowLocal', tagline: 'Hyper-Local Food Network', desc: 'Connects home gardeners with local buyers. Sell your surplus harvest to neighbors within a 5-mile radius.', founder: 'Sara M.', location: 'Portland, OR', raised: 22000, goal: 80000, backers: 318, daysLeft: 33, category: 'Sustainability', color: '#4ADE80', colorDim: 'rgba(74,222,128,0.10)', mode: 'Build' },
  { id: '6', emoji: '🎓', name: 'SkillBridge', tagline: 'Trade Skills Marketplace', desc: 'Teach what you know, learn what you need. Peer-to-peer skill exchange where expertise is the currency.', founder: 'Marcus T.', location: 'Atlanta, GA', raised: 0, goal: 0, backers: 0, daysLeft: 0, category: 'Education', color: '#C9A84C', colorDim: 'rgba(201,168,76,0.10)', mode: 'License' },
]

const CATEGORIES = ['All', 'AI & Tech', 'Hardware', 'Health', 'Social', 'Sustainability', 'Education']

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export default function BrowsePage() {
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = IDEAS.filter(idea => {
    const matchCat = filter === 'All' || idea.category.includes(filter)
    const matchSearch = !search || idea.name.toLowerCase().includes(search.toLowerCase()) || idea.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={{ height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontWeight: '500', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }}>Browse Ideas</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EDEAE2', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '7px 13px', width: '200px' }}>
          <span style={{ color: '#8A9AAC', fontSize: '13px' }}>⌕</span>
          <input type="text" placeholder="Search ideas…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#1A2332', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%' }} />
        </div>
        <button onClick={() => router.push('/launch')} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Launch Idea</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #18222E 0%, #1E2B3A 100%)', border: '1px solid rgba(201,168,76,0.20)', borderRadius: '16px', padding: '28px 32px', marginBottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '8px' }}>✦ Community Feed</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '600', color: '#EEE8D8', letterSpacing: '-0.02em', marginBottom: '6px' }}>Ideas worth <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>believing in.</em></h1>
          <p style={{ color: '#8E8B7A', fontSize: '13px', lineHeight: '1.6', maxWidth: '380px' }}>Browse live ideas from founders. Support the ones that speak to you.</p>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === cat ? 'rgba(201,168,76,0.4)' : 'rgba(26,35,50,0.15)'}`, background: filter === cat ? 'rgba(201,168,76,0.12)' : '#fff', color: filter === cat ? '#8A6018' : '#4A5A6C', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '11px', fontWeight: filter === cat ? '600' : '500', cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(296px, 1fr))', gap: '14px' }}>
          {filtered.map((idea) => (
            <div key={idea.id} style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)' }}>
              <div style={{ padding: '17px 17px 0', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: idea.colorDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{idea.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#EEE8D8', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idea.name} — {idea.tagline}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: idea.color }}>{idea.category}</div>
                </div>
                <div style={{ background: idea.mode === 'License' ? 'rgba(45,212,191,0.1)' : 'rgba(201,168,76,0.1)', border: `1px solid ${idea.mode === 'License' ? 'rgba(45,212,191,0.25)' : 'rgba(201,168,76,0.2)'}`, color: idea.mode === 'License' ? '#2DD4BF' : '#C9A84C', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: '4px', flexShrink: 0 }}>{idea.mode}</div>
              </div>
              <div style={{ padding: '12px 17px' }}>
                <p style={{ color: '#8E8B7A', fontSize: '12px', lineHeight: '1.65', marginBottom: '11px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }}>{idea.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '11px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${idea.color}, ${idea.colorDim})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#111923', flexShrink: 0 }}>{idea.founder[0]}</div>
                  <span style={{ fontSize: '11px', color: '#8E8B7A' }}>{idea.founder} · {idea.location}</span>
                </div>
                {idea.mode === 'Build' && idea.goal > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: idea.color }}>{fmt(idea.raised)}</span>
                      <span style={{ fontSize: '11px', color: '#8E8B7A' }}>of {fmt(idea.goal)}</span>
                    </div>
                    <div style={{ height: '4px', background: '#243344', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${Math.min(Math.round((idea.raised / idea.goal) * 100), 100)}%`, background: `linear-gradient(90deg, ${idea.color}, #C9A84C)` }} />
                    </div>
                  </>
                )}
                {idea.mode === 'License' && <div style={{ padding: '8px 12px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '7px', fontSize: '11px', color: '#2DD4BF', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>Open for licensing offers</div>}
              </div>
              <div style={{ padding: '11px 17px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {idea.backers > 0 && <span style={{ fontSize: '10px', color: '#8E8B7A' }}>👥 {idea.backers.toLocaleString()}</span>}
                  {idea.daysLeft > 0 && <span style={{ fontSize: '10px', color: '#8E8B7A' }}>⏰ {idea.daysLeft}d</span>}
                </div>
                <button style={{ border: 'none', padding: '6px 15px', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", background: idea.mode === 'License' ? 'linear-gradient(135deg, #2DD4BF, #1EBFAA)' : `linear-gradient(135deg, ${idea.color}, #C9A84C)`, color: '#111923' }}>
                  {idea.mode === 'License' ? 'Inquire' : 'Support'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8E8B7A' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>⬡</div>
            <div style={{ fontSize: '14px' }}>No ideas found.</div>
            <button onClick={() => { setFilter('All'); setSearch('') }} style={{ marginTop: '12px', background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '7px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  )
}
