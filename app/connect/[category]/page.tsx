'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  display_name: string
  tagline: string
  bio: string
  specialties: string[]
  location: string
  open_to: string[]
  verified: boolean
  website?: string
  is_placeholder?: boolean
}

type Idea = { id: string; name: string; pitch: string }

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; dim: string; border: string; desc: string }> = {
  engineers:     { label: 'Engineers',       icon: '💻', color: '#2DD4BF', dim: 'rgba(45,212,191,0.08)',  border: 'rgba(45,212,191,0.22)',  desc: 'Software, hardware, and mechanical engineers' },
  designers:     { label: 'Designers',       icon: '🎨', color: '#E07B8A', dim: 'rgba(224,123,138,0.08)', border: 'rgba(224,123,138,0.22)', desc: 'Product, UX, and brand designers' },
  manufacturers: { label: 'Manufacturers',   icon: '🏭', color: '#C9A84C', dim: 'rgba(201,168,76,0.08)',  border: 'rgba(201,168,76,0.22)',  desc: 'Manufacturing partners for physical products' },
  marketers:     { label: 'Marketers',       icon: '📢', color: '#A78BFA', dim: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.22)', desc: 'Growth, content, and paid acquisition specialists' },
  lawyers:       { label: 'Lawyers',         icon: '⚖️', color: '#94A3B8', dim: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.22)', desc: 'IP, startup, and corporate attorneys' },
  investors:     { label: 'Angel Investors', icon: '💰', color: '#4ADE80', dim: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.22)',  desc: 'Early-stage angels and micro-VCs' },
  team:          { label: 'Team Members',    icon: '🤝', color: '#F59E0B', dim: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)',  desc: 'People open to co-founding or joining early teams' },
  corporations:  { label: 'Corporations',    icon: '🏢', color: '#60A5FA', dim: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.22)',  desc: 'Companies looking to license innovative ideas' },
}

const PLACEHOLDERS: Record<string, Profile[]> = {
  engineers: [
    { id: 'ph-eng-1', display_name: 'Marcus T.', tagline: 'Full-stack engineer · 8 yrs building consumer apps', bio: 'Ex-Stripe engineer. I love working with founders early — before the product exists.', specialties: ['React', 'Node.js', 'iOS', 'APIs'], location: 'Austin, TX', open_to: ['Equity', 'Co-founder'], verified: true, is_placeholder: true },
    { id: 'ph-eng-2', display_name: 'Priya S.', tagline: 'ML engineer · Computer vision & data pipelines', bio: 'Built recommendation systems at two Series B startups. Open to advisory or part-time.', specialties: ['Python', 'ML/AI', 'Data', 'AWS'], location: 'Remote', open_to: ['Paid', 'Advisory'], verified: true, is_placeholder: true },
    { id: 'ph-eng-3', display_name: 'Jordan K.', tagline: 'Hardware engineer · IoT and embedded systems', bio: 'Designed three consumer hardware products. Know what it takes to go from prototype to factory.', specialties: ['Embedded', 'IoT', 'PCB Design', 'C++'], location: 'San Diego, CA', open_to: ['Equity', 'Paid'], verified: false, is_placeholder: true },
    { id: 'ph-eng-4', display_name: 'Amir L.', tagline: 'Backend architect · High-scale infrastructure', bio: 'Spent 6 years at Amazon. Now helping startups build systems that can actually scale.', specialties: ['AWS', 'Microservices', 'Go', 'Postgres'], location: 'New York, NY', open_to: ['Paid', 'Advisory'], verified: true, is_placeholder: true },
    { id: 'ph-eng-5', display_name: 'Sofia R.', tagline: 'Mobile engineer · iOS & Android', bio: 'Shipped 12 apps to the App Store. First-time founders are my favorite clients.', specialties: ['Swift', 'Kotlin', 'React Native', 'Firebase'], location: 'Miami, FL', open_to: ['Paid', 'Equity'], verified: false, is_placeholder: true },
  ],
  designers: [
    { id: 'ph-des-1', display_name: 'Nadia B.', tagline: 'Product designer · Zero-to-one specialist', bio: 'I help founders turn messy ideas into products people actually want to use.', specialties: ['Figma', 'UX Research', 'Prototyping', 'Design Systems'], location: 'Brooklyn, NY', open_to: ['Equity', 'Paid'], verified: true, is_placeholder: true },
    { id: 'ph-des-2', display_name: 'Elliot W.', tagline: 'Brand & visual designer · Startup identity', bio: 'Built brand systems for 40+ startups. Your idea deserves to look like it belongs.', specialties: ['Brand Identity', 'Illustration', 'Motion', 'Figma'], location: 'Remote', open_to: ['Paid'], verified: true, is_placeholder: true },
    { id: 'ph-des-3', display_name: 'Keiko M.', tagline: 'Industrial designer · Physical product development', bio: 'From CAD renders to production prototypes. Specialized in consumer hardware.', specialties: ['CAD', 'SolidWorks', 'Prototyping', 'CMF'], location: 'Los Angeles, CA', open_to: ['Equity', 'Paid'], verified: true, is_placeholder: true },
    { id: 'ph-des-4', display_name: 'Theo A.', tagline: 'UX designer · Conversion & onboarding flows', bio: 'I care about the moment someone first touches your product. Onboarding is everything.', specialties: ['UX', 'User Testing', 'Wireframing', 'Webflow'], location: 'Chicago, IL', open_to: ['Paid', 'Advisory'], verified: false, is_placeholder: true },
  ],
  manufacturers: [
    { id: 'ph-man-1', display_name: 'Brightline Mfg', tagline: 'US-based contract manufacturer · Apparel & accessories', bio: 'Domestic small-batch manufacturing with low MOQs. We work with startups.', specialties: ['Apparel', 'Accessories', 'Small Batch', 'USA-made'], location: 'Los Angeles, CA', open_to: ['Paid'], verified: true, is_placeholder: true },
    { id: 'ph-man-2', display_name: 'Pearl Source Co.', tagline: 'Overseas sourcing · Electronics & consumer goods', bio: 'Connecting US founders with vetted factories in Shenzhen and Taipei since 2012.', specialties: ['Electronics', 'Consumer Goods', 'Sourcing', 'QC'], location: 'San Francisco, CA', open_to: ['Paid'], verified: true, is_placeholder: true },
    { id: 'ph-man-3', display_name: 'FormCraft Labs', tagline: 'Rapid prototyping → production bridge', bio: 'We take you from first prototype to first run. Plastics, metals, and composites.', specialties: ['Prototyping', '3D Printing', 'Injection Mold', 'Metals'], location: 'Detroit, MI', open_to: ['Paid', 'Equity'], verified: true, is_placeholder: true },
    { id: 'ph-man-4', display_name: 'NaturaMade', tagline: 'Sustainable packaging & food-safe manufacturing', bio: 'Eco-certified facilities. Ideal for wellness, food, and beauty brands.', specialties: ['Packaging', 'Food-safe', 'Eco', 'Beauty'], location: 'Portland, OR', open_to: ['Paid'], verified: false, is_placeholder: true },
  ],
  marketers: [
    { id: 'ph-mkt-1', display_name: 'Camille F.', tagline: 'Growth marketer · D2C and mobile apps', bio: 'Took three consumer brands from $0 to $1M ARR with paid + organic. Numbers person.', specialties: ['Meta Ads', 'Google Ads', 'SEO', 'Email'], location: 'Remote', open_to: ['Equity', 'Paid'], verified: true, is_placeholder: true },
    { id: 'ph-mkt-2', display_name: 'Derek V.', tagline: 'Content strategist · B2B and SaaS', bio: 'I build content engines that generate demand without paid. Long game only.', specialties: ['Content', 'LinkedIn', 'SEO', 'Thought Leadership'], location: 'Denver, CO', open_to: ['Paid', 'Advisory'], verified: true, is_placeholder: true },
    { id: 'ph-mkt-3', display_name: 'Ifeoma O.', tagline: 'Brand storyteller · Launch campaigns', bio: 'Wrote launch narratives for 15+ consumer startups. Every product has a story — I find it.', specialties: ['Copywriting', 'PR', 'Launch', 'Positioning'], location: 'Atlanta, GA', open_to: ['Paid', 'Equity'], verified: false, is_placeholder: true },
    { id: 'ph-mkt-4', display_name: 'Studio Torque', tagline: 'Performance agency · Paid social & conversion', bio: 'Boutique team focused on early-stage founders who need real traction fast.', specialties: ['Paid Social', 'CRO', 'Creative Testing', 'Analytics'], location: 'New York, NY', open_to: ['Paid'], verified: true, is_placeholder: true },
  ],
  lawyers: [
    { id: 'ph-law-1', display_name: 'Rachel M., Esq.', tagline: 'IP & patent attorney · Startup specialist', bio: 'I help inventors protect their ideas before they share them with the world. Provisional patents, trademarks, NDAs.', specialties: ['Patents', 'Trademarks', 'IP Strategy', 'NDAs'], location: 'Washington, DC', open_to: ['Paid', 'Equity'], verified: true, is_placeholder: true },
    { id: 'ph-law-2', display_name: 'Voss Legal Group', tagline: 'Startup & venture law firm', bio: 'From incorporation to term sheets. We handle the legal so you can focus on building.', specialties: ['Incorporation', 'Contracts', 'Fundraising', 'Employment'], location: 'San Francisco, CA', open_to: ['Paid'], verified: true, is_placeholder: true },
    { id: 'ph-law-3', display_name: 'Daniel T., Esq.', tagline: 'Licensing & technology transactions attorney', bio: 'Specialized in IP licensing deals between inventors and corporations. 200+ deals closed.', specialties: ['Licensing', 'Tech Transactions', 'Royalties', 'Negotiation'], location: 'Chicago, IL', open_to: ['Paid', 'Advisory'], verified: true, is_placeholder: true },
    { id: 'ph-law-4', display_name: 'Clara H., Esq.', tagline: 'Employment & equity attorney for startups', bio: 'Cap tables, option pools, and founder agreements. Get your equity structure right early.', specialties: ['Equity', 'Option Pools', 'Employment', 'Cap Table'], location: 'Remote', open_to: ['Paid'], verified: false, is_placeholder: true },
  ],
  investors: [
    { id: 'ph-inv-1', display_name: 'The Watershed Fund', tagline: 'Pre-seed · Consumer, health, and climate', bio: 'Writing $25K–$150K checks into ideas with a clear why-now and a founder with lived experience.', specialties: ['Pre-seed', 'Consumer', 'Health', 'Climate'], location: 'New York, NY', open_to: ['Investment'], verified: true, is_placeholder: true },
    { id: 'ph-inv-2', display_name: 'James A.', tagline: 'Angel investor · B2B SaaS and dev tools', bio: 'Operator-turned-investor. Former CTO. I invest in founders I would have hired.', specialties: ['B2B SaaS', 'Dev Tools', 'Infrastructure', 'Angel'], location: 'San Francisco, CA', open_to: ['Investment', 'Advisory'], verified: true, is_placeholder: true },
    { id: 'ph-inv-3', display_name: 'Meridian Angels', tagline: 'Syndicate · Midwest founders', bio: 'We back overlooked founders building real businesses outside the usual hubs.', specialties: ['Syndicate', 'Midwest', 'Hardware', 'B2B'], location: 'Chicago, IL', open_to: ['Investment'], verified: true, is_placeholder: true },
    { id: 'ph-inv-4', display_name: 'Lucinda P.', tagline: 'Angel · Consumer goods and CPG', bio: 'Former Unilever exec. I back physical product founders who understand their customer deeply.', specialties: ['CPG', 'Consumer', 'Retail', 'D2C'], location: 'Austin, TX', open_to: ['Investment', 'Advisory'], verified: false, is_placeholder: true },
  ],
  team: [
    { id: 'ph-team-1', display_name: 'Owen B.', tagline: 'Operations & finance · Early-stage COO', bio: "I've been the first operator at two startups. Love getting in early and building the engine.", specialties: ['Operations', 'Finance', 'Process', 'Hiring'], location: 'Boston, MA', open_to: ['Co-founder', 'Equity'], verified: true, is_placeholder: true },
    { id: 'ph-team-2', display_name: 'Maya C.', tagline: 'Sales & partnerships · Revenue from zero', bio: 'Closed first $500K in revenue for my last two companies. Looking for the next one.', specialties: ['Sales', 'Partnerships', 'BD', 'Enterprise'], location: 'Remote', open_to: ['Co-founder', 'Equity', 'Paid'], verified: true, is_placeholder: true },
    { id: 'ph-team-3', display_name: 'Ben T.', tagline: 'Product manager · Consumer and marketplace', bio: "I'm the person who turns a founder's vision into a roadmap people actually ship.", specialties: ['Product', 'Roadmap', 'Analytics', 'Marketplace'], location: 'Los Angeles, CA', open_to: ['Equity', 'Co-founder'], verified: false, is_placeholder: true },
    { id: 'ph-team-4', display_name: 'Fatima A.', tagline: 'Community & growth · User acquisition', bio: 'Built communities of 50K+ users twice. The right community is your best growth channel.', specialties: ['Community', 'Growth', 'Social', 'Content'], location: 'Remote', open_to: ['Equity', 'Paid'], verified: false, is_placeholder: true },
    { id: 'ph-team-5', display_name: 'Chris L.', tagline: 'CFO/Finance · Fundraising and financial modeling', bio: 'Raised $12M across three companies as CFO. I make your numbers tell the right story.', specialties: ['Finance', 'Fundraising', 'Modeling', 'CFO'], location: 'New York, NY', open_to: ['Co-founder', 'Advisory'], verified: true, is_placeholder: true },
  ],
  corporations: [
    { id: 'ph-corp-1', display_name: 'Helix Consumer Brands', tagline: 'Fortune 500 · Actively licensing in health & wellness', bio: 'We license 8–12 consumer health ideas per year. Looking for patentable innovations with proven demand.', specialties: ['Health', 'Wellness', 'Consumer', 'CPG'], location: 'Chicago, IL', open_to: ['Licensing'], verified: true, is_placeholder: true },
    { id: 'ph-corp-2', display_name: 'Verdant Retail Group', tagline: 'Retail innovation arm · Sustainability focus', bio: 'Our innovation team scouts ideas in sustainable retail, packaging, and supply chain.', specialties: ['Retail', 'Sustainability', 'Packaging', 'Supply Chain'], location: 'Minneapolis, MN', open_to: ['Licensing', 'Acquisition'], verified: true, is_placeholder: true },
    { id: 'ph-corp-3', display_name: 'Axiom Tech Ventures', tagline: 'Corporate VC · Enterprise software licensing', bio: 'We partner with inventors to bring enterprise-grade software innovations to our client network.', specialties: ['Enterprise', 'SaaS', 'B2B', 'Tech'], location: 'San Francisco, CA', open_to: ['Licensing', 'Investment'], verified: true, is_placeholder: true },
    { id: 'ph-corp-4', display_name: 'Northwall Industrial', tagline: 'Manufacturing conglomerate · IP acquisition', bio: 'Looking for patented manufacturing process improvements and industrial IoT innovations.', specialties: ['Industrial', 'IoT', 'Manufacturing', 'Patents'], location: 'Detroit, MI', open_to: ['Licensing', 'Acquisition'], verified: true, is_placeholder: true },
  ],
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as string
  const meta = CATEGORY_META[category]

  const [search, setSearch] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [connectTarget, setConnectTarget] = useState<Profile | null>(null)
  const [message, setMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdeaId, setSelectedIdeaId] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    async function load() {
      if (!meta) return
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      setCurrentUser(userData.user)

      // Load user's ideas to optionally attach
      const { data: ideaData } = await supabase
        .from('ideas')
        .select('id, name, pitch')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setIdeas(ideaData || [])

      // Load real profiles from Supabase
      const { data: realProfiles } = await supabase
        .from('connect_profiles')
        .select('*')
        .contains('categories', [category])
        .order('verified', { ascending: false })
        .limit(20)

      const placeholders = PLACEHOLDERS[category] || []
      const real: Profile[] = (realProfiles || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        display_name: p.display_name as string,
        tagline: p.tagline as string,
        bio: p.bio as string,
        specialties: (p.specialties as string[]) || [],
        location: p.location as string || '',
        open_to: (p.open_to as string[]) || [],
        verified: p.verified as boolean || false,
        website: p.website as string || '',
        is_placeholder: false,
      }))

      setProfiles([...real, ...placeholders])
    }
    load()
  }, [category, meta, router])

  const filtered = profiles.filter(p =>
    search === '' ||
    p.display_name.toLowerCase().includes(search.toLowerCase()) ||
    p.tagline.toLowerCase().includes(search.toLowerCase()) ||
    p.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  const openConnect = useCallback((profile: Profile) => {
    setConnectTarget(profile)
    setMessage('')
    setSent(false)
    setSelectedIdeaId(ideas[0]?.id || '')
  }, [ideas])

  async function generateAIMessage() {
    if (!connectTarget) return
    setAiLoading(true)
    const idea = ideas.find(i => i.id === selectedIdeaId)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_connect_message',
          payload: {
            targetName: connectTarget.display_name,
            targetTagline: connectTarget.tagline,
            targetCategory: meta?.label,
            ideaName: idea?.name || null,
            ideaPitch: idea?.pitch || null,
          },
        }),
      })
      const data = await res.json()
      if (data.success) setMessage(data.data.message)
    } catch {
      // silently fail
    } finally {
      setAiLoading(false)
    }
  }

  async function sendRequest() {
    if (!message.trim() || !connectTarget || !currentUser) return
    setSending(true)
    await supabase.from('connect_requests').insert({
      from_user_id: currentUser.id,
      to_profile_id: connectTarget.id,
      idea_id: selectedIdeaId || null,
      message: message.trim(),
      status: 'pending',
    })
    setSending(false)
    setSent(true)
    setTimeout(() => setConnectTarget(null), 1800)
  }

  if (!meta) return (
    <div style={{ minHeight: '100vh', background: '#111923', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Category not found.
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/connect')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Connect</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>{meta.icon} {meta.label}</div>
        <button onClick={() => router.push('/connect/list-yourself')} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', color: '#C9A84C', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ List Yourself</button>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: meta.color, marginBottom: '10px' }}>◈ {meta.desc}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Verified <em style={{ fontStyle: 'italic', color: meta.color }}>{meta.label}</em>
          </h1>
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${meta.label.toLowerCase()} by name, skill, or specialty…`}
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(17,25,35,0.8)', border: `1px solid ${meta.border}`, borderRadius: '12px', color: '#EEE8D8', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const }}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8E8B7A', fontSize: '14px' }}>No results found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {filtered.map(profile => (
              <ProfileCard key={profile.id} profile={profile} meta={meta} onConnect={() => openConnect(profile)} />
            ))}
          </div>
        )}
      </div>

      {/* Connect Sheet */}
      {connectTarget && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setConnectTarget(null) }}
        >
          <div style={{ background: '#18222E', borderRadius: '22px 22px 0 0', padding: '24px 24px 40px', width: '100%', maxWidth: '600px', margin: '0 auto', maxHeight: '88vh', overflowY: 'auto', border: '1px solid rgba(201,168,76,0.14)', borderBottom: 'none', boxShadow: '0 -12px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(201,168,76,0.2)', margin: '0 auto 20px' }} />

            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>✦</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#EEE8D8', marginBottom: '8px' }}>Request sent.</div>
                <div style={{ color: '#8E8B7A', fontSize: '13px' }}>We&apos;ll let you know when {connectTarget.display_name} responds.</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#EEE8D8', marginBottom: '4px' }}>Connect with {connectTarget.display_name}</div>
                <div style={{ color: '#8E8B7A', fontSize: '13px', marginBottom: '22px' }}>{connectTarget.tagline}</div>

                {/* Attach idea */}
                {ideas.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)', marginBottom: '8px' }}>Attach an idea (optional)</div>
                    <select
                      value={selectedIdeaId}
                      onChange={e => setSelectedIdeaId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '10px', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none' }}
                    >
                      <option value=''>No idea attached</option>
                      {ideas.map(idea => (
                        <option key={idea.id} value={idea.id}>{idea.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }}>Your message</div>
                    <button
                      onClick={generateAIMessage}
                      disabled={aiLoading}
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: aiLoading ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: aiLoading ? 0.6 : 1 }}
                    >
                      {aiLoading ? '✦ Writing…' : '✦ Write it for me'}
                    </button>
                  </div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Introduce yourself and tell ${connectTarget.display_name} what you're working on…`}
                    rows={5}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none', resize: 'vertical' as const, lineHeight: '1.65', boxSizing: 'border-box' as const }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setConnectTarget(null)} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8B7A', padding: '12px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
                  <button
                    onClick={sendRequest}
                    disabled={!message.trim() || sending}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: !message.trim() || sending ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: !message.trim() || sending ? 0.5 : 1 }}
                  >
                    {sending ? 'Sending…' : 'Send Request →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileCard({ profile, meta, onConnect }: { profile: Profile, meta: typeof CATEGORY_META[string], onConnect: () => void }) {
  return (
    <div style={{ background: 'rgba(24,34,46,0.8)', border: '1px solid rgba(201,168,76,0.10)', borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: meta.dim, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: '18px', color: meta.color, fontWeight: '600', flexShrink: 0 }}>
          {profile.display_name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#EEE8D8' }}>{profile.display_name}</div>
            {profile.verified && (
              <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ADE80', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>✓ VERIFIED</div>
            )}
            {profile.is_placeholder && (
              <div style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>SAMPLE</div>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.4' }}>{profile.tagline}</div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.65', margin: 0 }}>{profile.bio}</p>

      {/* Specialties */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {profile.specialties.map(s => (
          <div key={s} style={{ background: meta.dim, border: `1px solid ${meta.border}`, color: meta.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '4px' }}>{s}</div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {profile.location && <div style={{ fontSize: '11px', color: '#4A4838' }}>📍 {profile.location}</div>}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {profile.open_to.map(o => (
              <div key={o} style={{ fontSize: '10px', color: '#8E8B7A', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: '4px' }}>Open to {o}</div>
            ))}
          </div>
        </div>
        <button
          onClick={onConnect}
          style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}
        >
          Connect →
        </button>
      </div>
    </div>
  )
}
