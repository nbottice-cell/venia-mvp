'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Idea = {
  id: string
  name: string
  pitch: string
  problem: string
  path: 'build' | 'license'
  framework: string
  upvotes: number
  downvotes: number
  created_at: string
  user_id: string
  isExample?: boolean
}

const EXAMPLE_IDEAS: Idea[] = [
  { id: 'example-1', name: 'EchoAI', pitch: 'AI that joins your calls, takes perfect notes, assigns action items, and sends follow-ups automatically — built for remote teams who waste hours recapping meetings.', problem: 'Remote teams spend more time recapping meetings than acting on them.', path: 'build', framework: 'frustration', upvotes: 214, downvotes: 12, created_at: '2026-01-10T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-2', name: 'SipStill', pitch: 'A smart coffee system that adapts your brew strength to your sleep quality and stress levels, pulled automatically from Apple Health each morning.', problem: 'People drink caffeine on autopilot, ignoring what their body actually needs that day.', path: 'build', framework: 'trend', upvotes: 187, downvotes: 8, created_at: '2026-01-18T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-3', name: 'Favilla', pitch: 'A dating app built around real-world check-ins — match with people at the same bar, coffee shop, or event right now, not people who were nearby three days ago.', problem: 'Dating apps feel artificial because they disconnect attraction from the moment it actually happens.', path: 'build', framework: 'frustration', upvotes: 143, downvotes: 31, created_at: '2026-02-02T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-4', name: 'GrowLocal', pitch: 'A hyper-local marketplace connecting home gardeners with neighbors who want fresh produce — sell your surplus harvest to people within a 5-mile radius.', problem: 'Home gardeners grow more than they can eat and have no easy way to sell locally without a farmers market.', path: 'license', framework: 'community', upvotes: 98, downvotes: 5, created_at: '2026-02-14T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-5', name: 'SkillBridge', pitch: 'A peer-to-peer skill exchange where expertise is the currency — teach what you know, learn what you need, no money changes hands.', problem: 'People have valuable skills they never monetize, and expensive skills they can never afford to learn.', path: 'license', framework: 'skill', upvotes: 76, downvotes: 3, created_at: '2026-03-01T00:00:00Z', user_id: 'example', isExample: true },
]

export default function BrowsePage() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'build' | 'license'>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [voted, setVoted] = useState<Record<string, 'up' | 'down'>>({})
  const [voting, setVoting] = useState<string | null>(null)
  const [investModal, setInvestModal] = useState<Idea | null>(null)
  const [investAmount, setInvestAmount] = useState('')
  const [investDone, setInvestDone] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      setCurrentUserId(userData.user.id)

      const { data } = await supabase
        .from('ideas')
        .select('id, name, pitch, problem, path, framework, upvotes, downvotes, created_at, user_id')
        .order('upvotes', { ascending: false })

      const real = (data || []) as Idea[]
      setIdeas([...real, ...EXAMPLE_IDEAS])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = ideas.filter(idea => {
    const matchFilter = filter === 'all' || idea.path === filter
    const matchSearch = !search || idea.name.toLowerCase().includes(search.toLowerCase()) || idea.pitch?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  async function vote(ideaId: string, type: 'up' | 'down') {
    if (voting) return
    const existing = voted[ideaId]
    if (existing === type) return // already voted this way
    setVoting(ideaId)

    const idea = ideas.find(i => i.id === ideaId)
    if (!idea) { setVoting(null); return }

    // Calculate new counts
    const updates: { upvotes?: number, downvotes?: number } = {}
    if (type === 'up') {
      updates.upvotes = (idea.upvotes || 0) + 1
      if (existing === 'down') updates.downvotes = Math.max(0, (idea.downvotes || 0) - 1)
    } else {
      updates.downvotes = (idea.downvotes || 0) + 1
      if (existing === 'up') updates.upvotes = Math.max(0, (idea.upvotes || 0) - 1)
    }

    const { error } = await supabase.from('ideas').update(updates).eq('id', ideaId)
    if (!error) {
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, ...updates } : i))
      setVoted(prev => ({ ...prev, [ideaId]: type }))
    }
    setVoting(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={{ height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky' as const, top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }}>Browse Ideas</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EDEAE2', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '7px 13px', width: '180px' }}>
          <span style={{ color: '#8A9AAC', fontSize: '13px' }}>⌕</span>
          <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#1A2332', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%' }} />
        </div>
        <button onClick={() => router.push('/launch')} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Launch Idea</button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #18222E 0%, #1E2B3A 100%)', border: '1px solid rgba(201,168,76,0.20)', borderRadius: '16px', padding: '28px 32px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '8px' }}>✦ Community Feed</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '600', color: '#EEE8D8', letterSpacing: '-0.02em', marginBottom: '6px' }}>Ideas worth <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>believing in.</em></h1>
          <p style={{ color: '#8E8B7A', fontSize: '13px', lineHeight: '1.6' }}>Browse ideas from the community. Upvote the ones that excite you.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {(['all', 'build', 'license'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${filter === f ? 'rgba(201,168,76,0.4)' : 'rgba(26,35,50,0.15)'}`, background: filter === f ? 'rgba(201,168,76,0.12)' : '#fff', color: filter === f ? '#8A6018' : '#4A5A6C', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '11px', fontWeight: filter === f ? '600' : '500', cursor: 'pointer', textTransform: 'capitalize' as const }}>
              {f === 'all' ? 'All Ideas' : f === 'build' ? '⚡ Build' : '🏛️ License'}
            </button>
          ))}
        </div>

        {/* Ideas list */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8E8B7A', fontSize: '13px' }}>Loading ideas…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>⬡</div>
            <div style={{ fontSize: '14px', color: '#8E8B7A' }}>{search ? 'No ideas match your search.' : 'No ideas yet. Be the first to launch one.'}</div>
            {!search && <button onClick={() => router.push('/launch')} style={{ marginTop: '16px', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '10px 22px', borderRadius: '9px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Launch an Idea →</button>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(idea => {
            const isOwn = idea.user_id === currentUserId
            const isExample = idea.isExample
            const userVote = voted[idea.id]
            const isVoting = voting === idea.id
            const score = (idea.upvotes || 0) - (idea.downvotes || 0)

            return (
              <div key={idea.id} style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
                <div style={{ padding: '20px 20px 16px', display: 'flex', gap: '16px' }}>

                  {/* Vote column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => !isOwn && !isExample && vote(idea.id, 'up')}
                      disabled={isOwn || isExample || isVoting}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${userVote === 'up' ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.08)'}`, background: userVote === 'up' ? 'rgba(74,222,128,0.12)' : 'transparent', color: userVote === 'up' ? '#4ADE80' : '#4A4838', cursor: isOwn || isExample ? 'default' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', opacity: isOwn || isExample ? 0.4 : 1 }}>
                      ▲
                    </button>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '600', color: score > 0 ? '#4ADE80' : score < 0 ? '#E07B8A' : '#4A4838', minWidth: '20px', textAlign: 'center' }}>{score}</div>
                    <button
                      onClick={() => !isOwn && !isExample && vote(idea.id, 'down')}
                      disabled={isOwn || isExample || isVoting}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${userVote === 'down' ? 'rgba(224,123,138,0.5)' : 'rgba(255,255,255,0.08)'}`, background: userVote === 'down' ? 'rgba(224,123,138,0.12)' : 'transparent', color: userVote === 'down' ? '#E07B8A' : '#4A4838', cursor: isOwn || isExample ? 'default' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', opacity: isOwn || isExample ? 0.4 : 1 }}>
                      ▼
                    </button>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>{idea.name}</div>
                      <div style={{ background: idea.path === 'license' ? 'rgba(45,212,191,0.1)' : 'rgba(201,168,76,0.1)', border: `1px solid ${idea.path === 'license' ? 'rgba(45,212,191,0.25)' : 'rgba(201,168,76,0.2)'}`, color: idea.path === 'license' ? '#2DD4BF' : '#C9A84C', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>
                        {idea.path === 'license' ? '🏛️ License' : '⚡ Build'}
                      </div>
                      {isOwn && <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(201,168,76,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>Yours</div>}
                    </div>
                    <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6', marginBottom: '12px' }}>{idea.pitch}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' as const }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.06em' }}>{new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      {isOwn ? (
                        <button onClick={() => router.push(`/ideas/${idea.id}`)} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit →</button>
                      ) : !isExample ? (
                        <button onClick={() => { setInvestModal(idea); setInvestAmount(''); setInvestDone(false) }} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>💰 Invest</button>
                      ) : (
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.35)', padding: '4px 0' }}>Example idea</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invest modal */}
      {investModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setInvestModal(null)}>
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            {!investDone ? (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '8px' }}>💰 Invest in this idea</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#EEE8D8', marginBottom: '6px' }}>{investModal.name}</div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6', marginBottom: '24px' }}>{investModal.pitch}</p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }}>Investment amount</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' as const }}>
                    {['$100', '$500', '$1,000', '$5,000'].map(amt => (
                      <button key={amt} onClick={() => setInvestAmount(amt)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${investAmount === amt ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, background: investAmount === amt ? 'rgba(201,168,76,0.12)' : 'transparent', color: investAmount === amt ? '#C9A84C' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{amt}</button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter a custom amount…"
                    value={investAmount}
                    onChange={e => setInvestAmount(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' as const }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                  />
                </div>

                <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '4px' }}>Coming Soon</div>
                  <p style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.55' }}>Investment processing is not yet live. Submitting your interest lets the founder know you are serious and reserves your place when it opens.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setInvestModal(null)} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8B7A', padding: '12px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
                  <button onClick={() => setInvestDone(true)} disabled={!investAmount} style={{ flex: 2, background: investAmount ? 'linear-gradient(135deg, #C9A84C, #E2C06A)' : 'rgba(201,168,76,0.2)', color: '#111923', border: 'none', padding: '12px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: investAmount ? 'pointer' : 'not-allowed', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Express Interest →</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>✦</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: '10px' }}>Interest noted.</div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '24px' }}>The founder of <strong style={{ color: '#C9A84C' }}>{investModal.name}</strong> will be notified when investment opens. We will reach out when it is time.</p>
                <button onClick={() => setInvestModal(null)} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 28px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Back to Feed</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
