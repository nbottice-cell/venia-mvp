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
  solution?: string
  customer?: string
  why_now?: string
  unfair_advantage?: string
  path: 'build' | 'license'
  framework: string
  upvotes: number
  downvotes: number
  created_at: string
  user_id: string
  isExample?: boolean
}

const EXAMPLE_IDEAS: Idea[] = [
  { id: 'example-1', name: 'EchoAI', pitch: 'AI that joins your calls, takes perfect notes, assigns action items, and sends follow-ups automatically — built for remote teams who waste hours recapping meetings.', problem: 'Remote teams spend more time recapping meetings than acting on them. The average knowledge worker spends 31 hours per month in unproductive meetings, and half of that time is spent on follow-up recaps that should be automatic.', solution: 'EchoAI silently joins video calls, generates real-time transcripts, identifies action items and owners, and sends structured follow-up emails to all attendees within minutes of the call ending — requiring zero manual effort from anyone.', customer: 'Remote-first teams of 5–50 people, particularly team leads and project managers who run recurring standups, sprint reviews, and client calls.', why_now: 'AI transcription has finally reached the accuracy needed for professional use, and remote work has made meeting fatigue a recognized crisis. Integrations with Zoom, Meet, and Teams are now standard and well-documented.', unfair_advantage: 'EchoAI learns each team\'s vocabulary, acronyms, and recurring project names over time — making its summaries dramatically more accurate than generic tools after just a few calls.', path: 'build', framework: 'frustration', upvotes: 214, downvotes: 12, created_at: '2026-01-10T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-2', name: 'SipStill', pitch: 'A smart coffee system that adapts your brew strength to your sleep quality and stress levels, pulled automatically from Apple Health each morning.', problem: 'People drink caffeine on autopilot, ignoring what their body actually needs that day. On poor sleep nights, most people drink more coffee — which worsens their next night\'s sleep and creates a compounding cycle.', solution: 'SipStill connects to Apple Health each morning, reads your sleep score and HRV, and automatically adjusts the brew strength and timing recommendation for your day. A companion app shows your patterns over time.', customer: 'Health-conscious coffee drinkers aged 25–40 who already track their biometrics with an Apple Watch or Oura Ring and want their environment to respond intelligently.', why_now: 'Wearable health data has become granular and reliable enough to make personalized recommendations. Smart home appliances are increasingly API-accessible, and consumers expect their devices to talk to each other.', unfair_advantage: 'The founder has a background in nutritional biochemistry and has built relationships with two specialty roasters willing to create proprietary blends optimized for different biometric profiles.', path: 'build', framework: 'trend', upvotes: 187, downvotes: 8, created_at: '2026-01-18T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-3', name: 'Favilla', pitch: 'A dating app built around real-world check-ins — match with people at the same bar, coffee shop, or event right now, not people who were nearby three days ago.', problem: 'Dating apps feel artificial because they disconnect attraction from the moment it actually happens. People scroll profiles at home but the real connection happens in the room — and there is currently no bridge between those two moments.', solution: 'Favilla lets users check in to a venue and instantly see other singles who are there right now. Matches happen in real time, while both people are still in the same place, making the first message feel natural instead of cold.', customer: 'Singles aged 22–35 who are already going out but frustrated that dating apps feel disconnected from their real social life. Early adopters are bar regulars, event-goers, and anyone tired of ghosting.', why_now: 'Post-pandemic, people are actively seeking in-person connection again. Location-sharing comfort has increased significantly, and the backlash against swipe culture creates a real opening for presence-based alternatives.', unfair_advantage: 'Favilla\'s check-in model creates a natural density flywheel — the more venues that promote it, the more users show up, which attracts more venues. Venue partnerships are the distribution moat.', path: 'build', framework: 'frustration', upvotes: 143, downvotes: 31, created_at: '2026-02-02T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-4', name: 'GrowLocal', pitch: 'A hyper-local marketplace connecting home gardeners with neighbors who want fresh produce — sell your surplus harvest to people within a 5-mile radius.', problem: 'Home gardeners grow more than they can eat and have no easy way to sell locally without a farmers market booth. At the same time, neighbors pay premium prices at grocery stores for produce that traveled 1,500 miles.', solution: 'GrowLocal is a neighborhood marketplace where gardeners list their surplus — tomatoes, herbs, eggs, honey — and nearby buyers can order for same-day pickup or drop-off. Think Craigslist meets Etsy for backyard harvests.', customer: 'Home gardeners with surplus produce, and suburban families who want local food without a CSA commitment. Dense residential neighborhoods with active NextDoor communities are the ideal launch markets.', why_now: 'Interest in local food sourcing spiked during COVID and has not receded. Urban farming has tripled in the last decade, and the infrastructure for peer-to-peer payments makes micro-transactions frictionless.', unfair_advantage: 'The founder is a Master Gardener with an existing network of 400+ home growers across three counties, giving the marketplace immediate supply before a single marketing dollar is spent.', path: 'license', framework: 'community', upvotes: 98, downvotes: 5, created_at: '2026-02-14T00:00:00Z', user_id: 'example', isExample: true },
  { id: 'example-5', name: 'SkillBridge', pitch: 'A peer-to-peer skill exchange where expertise is the currency — teach what you know, learn what you need, no money changes hands.', problem: 'People have valuable skills they never monetize, and expensive skills they can never afford to learn. A graphic designer who wants to learn bookkeeping and an accountant who wants to learn design have no way to find each other.', solution: 'SkillBridge matches people for skill swaps — one hour of your expertise for one hour of theirs. A credit system balances asymmetric exchanges and lets users bank time to spend later with anyone on the platform.', customer: 'Freelancers, side-hustlers, and career-changers who are rich in one skill but cash-poor for acquiring others. Early community: bootcamp grads, creative professionals, and solopreneurs.', why_now: 'The gig economy has made skill ownership the new resume. People are more comfortable teaching online post-pandemic, and platforms like Clubhouse and Maven proved appetite for peer-led learning.', unfair_advantage: 'SkillBridge has no cash transaction to tax, regulate, or charge fees on — making it structurally impossible for large platforms to replicate without undermining their revenue model.', path: 'license', framework: 'skill', upvotes: 76, downvotes: 3, created_at: '2026-03-01T00:00:00Z', user_id: 'example', isExample: true },
]

export default function BrowsePage() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'build' | 'license'>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [voted, setVoted] = useState<Record<string, 'up'>>({})
  const [voting, setVoting] = useState<string | null>(null)
  const [investModal, setInvestModal] = useState<Idea | null>(null)
  const [investAmount, setInvestAmount] = useState('')
  const [investDone, setInvestDone] = useState(false)
  const [fundModal, setFundModal] = useState<Idea | null>(null)
  const [fundAmount, setFundAmount] = useState('')
  const [fundDone, setFundDone] = useState(false)
  const [detailIdea, setDetailIdea] = useState<Idea | null>(null)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      setCurrentUserId(userData.user.id)

      const { data } = await supabase
        .from('ideas')
        .select('id, name, pitch, problem, solution, customer, why_now, unfair_advantage, path, framework, upvotes, downvotes, created_at, user_id')
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

  function getVerificationTier(upvotes: number) {
    if (upvotes >= 150) return { label: 'Verified', icon: '✦', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.3)' }
    if (upvotes >= 75)  return { label: 'Community Pick', icon: '⭐', color: '#E2C06A', bg: 'rgba(226,192,106,0.1)', border: 'rgba(226,192,106,0.25)' }
    if (upvotes >= 25)  return { label: 'Gaining Steam', icon: '🔥', color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' }
    if (upvotes >= 10)  return { label: 'Early Signal', icon: '🌱', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' }
    return null
  }

  async function upvote(ideaId: string) {
    if (voting) return
    const idea = ideas.find(i => i.id === ideaId)
    if (!idea || idea.isExample || idea.user_id === currentUserId) return
    setVoting(ideaId)

    const alreadyLiked = voted[ideaId] === 'up'
    const newUpvotes = alreadyLiked ? Math.max(0, (idea.upvotes || 0) - 1) : (idea.upvotes || 0) + 1

    const { error } = await supabase.from('ideas').update({ upvotes: newUpvotes }).eq('id', ideaId)
    if (!error) {
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, upvotes: newUpvotes } : i))
      if (alreadyLiked) {
        setVoted(prev => { const n = { ...prev }; delete n[ideaId]; return n })
      } else {
        setVoted(prev => ({ ...prev, [ideaId]: 'up' }))
      }
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
            const isLiked = voted[idea.id] === 'up'
            const isVoting = voting === idea.id
            const tier = getVerificationTier(idea.upvotes || 0)
            const canInteract = !isOwn && !isExample

            return (
              <div key={idea.id} style={{ background: '#18222E', border: `1px solid ${tier ? tier.border : 'rgba(201,168,76,0.12)'}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => setDetailIdea(idea)}>
                <div style={{ padding: '20px 20px 16px', display: 'flex', gap: '16px' }}>

                  {/* Upvote column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => upvote(idea.id)}
                      disabled={!canInteract || isVoting}
                      title={isOwn ? "Can't upvote your own idea" : isExample ? 'Example idea' : isLiked ? 'Remove upvote' : 'Upvote this idea'}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${isLiked ? 'rgba(224,123,138,0.5)' : 'rgba(255,255,255,0.12)'}`, background: isLiked ? 'rgba(224,123,138,0.15)' : 'transparent', color: isLiked ? '#E07B8A' : '#8E8B7A', cursor: canInteract ? 'pointer' : 'default', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', opacity: canInteract ? 1 : 0.4 }}>
                      {isLiked ? '♥' : '♡'}
                    </button>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '600', color: (idea.upvotes || 0) > 0 ? '#E07B8A' : '#8E8B7A', minWidth: '20px', textAlign: 'center' }}>{idea.upvotes || 0}</div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>{idea.name}</div>
                      {tier && (
                        <div style={{ background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>
                          {tier.icon} {tier.label}
                        </div>
                      )}
                      <div style={{ background: idea.path === 'license' ? 'rgba(45,212,191,0.1)' : 'rgba(201,168,76,0.1)', border: `1px solid ${idea.path === 'license' ? 'rgba(45,212,191,0.25)' : 'rgba(201,168,76,0.2)'}`, color: idea.path === 'license' ? '#2DD4BF' : '#C9A84C', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>
                        {idea.path === 'license' ? '🏛️ License' : '⚡ Build'}
                      </div>
                      {isOwn && <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(201,168,76,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>Yours</div>}
                    </div>
                    <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6', marginBottom: '12px' }}>{idea.pitch}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.06em' }}>{new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      {isOwn ? (
                        <button onClick={() => router.push(`/ideas/${idea.id}`)} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit →</button>
                      ) : !isExample ? (
                        <>
                          <button onClick={() => { setInvestModal(idea); setInvestAmount(''); setInvestDone(false) }} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📈 Invest</button>
                          <button onClick={() => { setFundModal(idea); setFundAmount(''); setFundDone(false) }} style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', color: '#2DD4BF', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🏦 Fund</button>
                        </>
                      ) : (
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.35)', padding: '4px 0' }}>Example idea</div>
                      )}
                      <div style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.4)' }}>View brief →</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Idea detail modal */}
      {detailIdea && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setDetailIdea(null)}>
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px 20px 0 0', padding: '0', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -8px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '14px', paddingBottom: '4px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)' }} />
            </div>
            <div style={{ padding: '20px 28px 36px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600', color: '#EEE8D8', letterSpacing: '-0.01em', lineHeight: '1.2', marginBottom: '8px' }}>{detailIdea.name}</div>
                  <p style={{ fontSize: '14px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '0' }}>{detailIdea.pitch}</p>
                </div>
                <div style={{ background: detailIdea.path === 'license' ? 'rgba(45,212,191,0.1)' : 'rgba(201,168,76,0.1)', border: `1px solid ${detailIdea.path === 'license' ? 'rgba(45,212,191,0.25)' : 'rgba(201,168,76,0.2)'}`, color: detailIdea.path === 'license' ? '#2DD4BF' : '#C9A84C', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '4px 10px', borderRadius: '4px', flexShrink: 0, marginTop: '4px' }}>
                  {detailIdea.path === 'license' ? '🏛️ License' : '⚡ Build'}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(201,168,76,0.1)', margin: '20px 0' }} />

              {/* Brief sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'The Problem', value: detailIdea.problem, icon: '◈' },
                  { label: 'The Solution', value: detailIdea.solution, icon: '◉' },
                  { label: 'The Customer', value: detailIdea.customer, icon: '◎' },
                  { label: 'Why Now', value: detailIdea.why_now, icon: '⬡' },
                  { label: 'Unfair Advantage', value: detailIdea.unfair_advantage, icon: '✦' },
                ].filter(s => s.value).map(section => (
                  <div key={section.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                      <span style={{ color: '#C9A84C', fontSize: '11px' }}>{section.icon}</span>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }}>{section.label}</div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#C5BBA8', lineHeight: '1.7', margin: 0 }}>{section.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(201,168,76,0.1)', margin: '24px 0' }} />

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Upvote row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => upvote(detailIdea.id)}
                    disabled={detailIdea.isExample || detailIdea.user_id === currentUserId || voting === detailIdea.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: voted[detailIdea.id] === 'up' ? 'rgba(224,123,138,0.12)' : 'rgba(17,25,35,0.6)', border: `1px solid ${voted[detailIdea.id] === 'up' ? 'rgba(224,123,138,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '9px', padding: '10px 18px', cursor: detailIdea.isExample || detailIdea.user_id === currentUserId ? 'default' : 'pointer', opacity: detailIdea.isExample || detailIdea.user_id === currentUserId ? 0.4 : 1, transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '18px', color: voted[detailIdea.id] === 'up' ? '#E07B8A' : '#8E8B7A' }}>{voted[detailIdea.id] === 'up' ? '♥' : '♡'}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: '600', color: voted[detailIdea.id] === 'up' ? '#E07B8A' : '#8E8B7A' }}>{ideas.find(i => i.id === detailIdea.id)?.upvotes || detailIdea.upvotes || 0}</span>
                    <span style={{ fontSize: '11px', color: '#8E8B7A' }}>{voted[detailIdea.id] === 'up' ? 'Liked' : 'Like this idea'}</span>
                  </button>
                  {(() => { const t = getVerificationTier(ideas.find(i => i.id === detailIdea.id)?.upvotes || detailIdea.upvotes || 0); return t ? <div style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '5px 10px', borderRadius: '6px' }}>{t.icon} {t.label}</div> : null })()}
                  <button onClick={() => setDetailIdea(null)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8B7A', padding: '10px 14px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✕</button>
                </div>

                {/* Invest / Fund row */}
                {!detailIdea.isExample && detailIdea.user_id !== currentUserId && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setDetailIdea(null); setInvestModal(detailIdea); setInvestAmount(''); setInvestDone(false) }} style={{ flex: 1, background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📈 Invest in this Idea</button>
                    <button onClick={() => { setDetailIdea(null); setFundModal(detailIdea); setFundAmount(''); setFundDone(false) }} style={{ flex: 1, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.35)', color: '#2DD4BF', padding: '12px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🏦 Fund this Idea</button>
                  </div>
                )}
                {detailIdea.user_id === currentUserId && (
                  <button onClick={() => { setDetailIdea(null); router.push(`/ideas/${detailIdea.id}`) }} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '12px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit your idea →</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invest modal — sandbox equity simulator */}
      {investModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setInvestModal(null)}>
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            {!investDone ? (
              <>
                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🎲</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C' }}>Sandbox Mode — No real money involved</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '8px' }}>📈 Claim a Sandbox Equity Stake</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#EEE8D8', marginBottom: '6px' }}>{investModal.name}</div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6', marginBottom: '24px' }}>{investModal.pitch}</p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }}>Equity stake (sandbox %)</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' as const }}>
                    {['0.5%', '1%', '2%', '5%', '10%'].map(pct => (
                      <button key={pct} onClick={() => setInvestAmount(pct)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${investAmount === pct ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, background: investAmount === pct ? 'rgba(201,168,76,0.12)' : 'transparent', color: investAmount === pct ? '#C9A84C' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{pct}</button>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(201,168,76,0.5)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', marginBottom: 0 }}>This claim is fictional — like Monopoly deeds. It signals your interest to the founder.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setInvestModal(null)} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8B7A', padding: '12px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
                  <button onClick={() => setInvestDone(true)} disabled={!investAmount} style={{ flex: 2, background: investAmount ? 'linear-gradient(135deg, #C9A84C, #E2C06A)' : 'rgba(201,168,76,0.2)', color: '#111923', border: 'none', padding: '12px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: investAmount ? 'pointer' : 'not-allowed', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Claim Stake →</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: '10px' }}>Stake claimed.</div>
                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#C9A84C', marginBottom: '4px' }}>Your Sandbox Portfolio</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#EEE8D8', fontFamily: "'Playfair Display', serif" }}>{investAmount} of {investModal.name}</div>
                  <div style={{ fontSize: '11px', color: '#8E8B7A', marginTop: '4px' }}>Imaginary equity · Not a real security</div>
                </div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '24px' }}>The founder can see your interest. When {investModal.name} is ready for real funding, you will be first to know.</p>
                <button onClick={() => setInvestModal(null)} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 28px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Back to Feed</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fund modal — Venia Credits crowdfunding simulator */}
      {fundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setFundModal(null)}>
          <div style={{ background: '#18222E', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            {!fundDone ? (
              <>
                <div style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🎲</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#2DD4BF' }}>Sandbox Mode — Venia Credits, not real money</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#2DD4BF', marginBottom: '8px' }}>🏦 Back this Idea with Venia Credits</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#EEE8D8', marginBottom: '6px' }}>{fundModal.name}</div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6', marginBottom: '24px' }}>{fundModal.pitch}</p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(45,212,191,0.7)' }}>Pledge amount in Ⓥ Credits</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                    {['Ⓥ 500', 'Ⓥ 1,000', 'Ⓥ 5,000', 'Ⓥ 10,000'].map(amt => (
                      <button key={amt} onClick={() => setFundAmount(amt)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${fundAmount === amt ? 'rgba(45,212,191,0.45)' : 'rgba(255,255,255,0.08)'}`, background: fundAmount === amt ? 'rgba(45,212,191,0.12)' : 'transparent', color: fundAmount === amt ? '#2DD4BF' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{amt}</button>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#2DD4BF', letterSpacing: '0.1em', marginBottom: '5px' }}>WHAT ARE VENIA CREDITS?</div>
                    <p style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.55', margin: 0 }}>Venia Credits are imaginary crowdfunding tokens — like Monopoly money. They signal your enthusiasm to the founder and help ideas gain community momentum. No real currency is involved.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setFundModal(null)} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8B7A', padding: '12px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
                  <button onClick={() => setFundDone(true)} disabled={!fundAmount} style={{ flex: 2, background: fundAmount ? 'linear-gradient(135deg, #2DD4BF, #1EBFAA)' : 'rgba(45,212,191,0.2)', color: '#111923', border: 'none', padding: '12px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: fundAmount ? 'pointer' : 'not-allowed', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pledge Credits →</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: '10px' }}>You backed this idea.</div>
                <div style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#2DD4BF', marginBottom: '4px' }}>Your Sandbox Pledge</div>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#EEE8D8', fontFamily: "'Playfair Display', serif" }}>{fundAmount}</div>
                  <div style={{ fontSize: '11px', color: '#8E8B7A', marginTop: '4px' }}>Venia Credits · Imaginary currency</div>
                </div>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '24px' }}>Your support has been logged. The founder of <strong style={{ color: '#2DD4BF' }}>{fundModal.name}</strong> can see your backing. When real funding opens, believers like you go first.</p>
                <button onClick={() => setFundModal(null)} style={{ background: 'linear-gradient(135deg, #2DD4BF, #1EBFAA)', color: '#111923', border: 'none', padding: '12px 28px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Back to Feed</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
