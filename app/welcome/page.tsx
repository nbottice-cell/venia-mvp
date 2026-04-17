'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const doors = [
  { id: 'launch', icon: '◈', title: 'Launch an Idea', subtitle: 'Ready to build?', desc: 'Have an idea already, or want to find one? AI walks you through every step from raw concept to a live listing.', color: '#C9A84C', colorDim: 'rgba(201,168,76,0.10)', colorBorder: 'rgba(201,168,76,0.30)', tag: 'Create', path: '/launch' },
  { id: 'browse', icon: '⬡', title: 'Browse Ideas', subtitle: 'Community feed', desc: 'Explore ideas from other founders. Upvote the ones you believe in and see what the community is building.', color: '#E07B8A', colorDim: 'rgba(224,123,138,0.10)', colorBorder: 'rgba(224,123,138,0.30)', tag: 'Explore', path: '/browse' },
  { id: 'ideas', icon: '◎', title: 'My Ideas', subtitle: 'Your work', desc: 'View, edit, and build on the ideas you have already created. All your briefs in one place.', color: '#2DD4BF', colorDim: 'rgba(45,212,191,0.10)', colorBorder: 'rgba(45,212,191,0.30)', tag: 'My Work', path: '/ideas' },
  { id: 'learn', icon: '✦', title: 'Learn About Venia', subtitle: 'New here?', desc: 'Discover what Venia is, how it works, and the different ways you can use it to go from idea to income.', color: '#8E8B7A', colorDim: 'rgba(142,139,122,0.10)', colorBorder: 'rgba(142,139,122,0.25)', tag: 'Start Here', path: '/learn' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [hovering, setHovering] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Founder'
      setUserName(name)
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>Venia</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '400', lineHeight: '1.2', color: '#EEE8D8', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          {userName ? <>Good to have you, <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>{userName.split(' ')[0]}.</em></> : <>Where would you like to <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>begin?</em></>}
        </h1>
        <p style={{ color: '#8E8B7A', fontSize: '15px', lineHeight: '1.65', maxWidth: '420px', margin: '0 auto' }}>Choose your starting point. You can always change direction.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%', maxWidth: '960px', position: 'relative', zIndex: 1 }}>
        {doors.map((door, i) => (
          <button key={door.id} onClick={() => router.push(door.path)} onMouseEnter={() => setHovering(door.id)} onMouseLeave={() => setHovering(null)}
            style={{ background: hovering === door.id ? door.colorDim : 'rgba(24,34,46,0.7)', border: `1px solid ${hovering === door.id ? door.colorBorder : 'rgba(201,168,76,0.10)'}`, borderRadius: '18px', padding: '32px 28px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s ease', transform: hovering === door.id ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hovering === door.id ? `0 16px 48px rgba(0,0,0,0.3)` : '0 4px 16px rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: door.colorDim, border: `1px solid ${door.colorBorder}`, borderRadius: '20px', padding: '4px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: door.color, marginBottom: '20px' }}>{door.tag}</div>
            <div style={{ fontSize: '32px', marginBottom: '14px', color: door.color, lineHeight: '1', display: 'block' }}>{door.icon}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: door.color, marginBottom: '8px', opacity: 0.7 }}>{door.subtitle}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: '10px', letterSpacing: '-0.01em', lineHeight: '1.2' }}>{door.title}</h2>
            <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '22px' }}>{door.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '600', color: door.color }}>
              <span style={{ marginRight: '8px' }}>Go {door.title.split(' ')[0]}</span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>

      <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth') }} style={{ marginTop: '36px', background: 'none', border: 'none', color: 'rgba(74,72,56,0.5)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Sign Out
      </button>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
