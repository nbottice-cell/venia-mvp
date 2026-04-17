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
  status: string
  created_at: string
}

export default function IdeasPage() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      const { data, error } = await supabase
        .from('ideas')
        .select('id, name, pitch, problem, path, framework, status, created_at')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
      if (error) { setError(error.message); setLoading(false); return }
      setIdeas(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const navStyle: React.CSSProperties = { height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={navStyle}>
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }}>My Ideas</div>
        <button onClick={() => router.push('/launch')} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ New Idea</button>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8E8B7A', fontSize: '13px' }}>Loading your ideas…</div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#E07B8A', fontSize: '13px' }}>{error}</div>
        )}

        {!loading && !error && ideas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px', opacity: 0.3 }}>⬡</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#1A2332', marginBottom: '8px' }}>No ideas yet.</div>
            <div style={{ color: '#8E8B7A', fontSize: '13px', marginBottom: '24px' }}>Launch your first idea to see it here.</div>
            <button onClick={() => router.push('/launch')} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '11px 24px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Launch an Idea →</button>
          </div>
        )}

        {!loading && ideas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ideas.map(idea => (
              <button key={idea.id} onClick={() => router.push(`/ideas/${idea.id}`)}
                style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '14px', padding: '20px 22px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.14)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#EEE8D8' }}>{idea.name}</div>
                      <div style={{ background: idea.path === 'license' ? 'rgba(45,212,191,0.1)' : 'rgba(201,168,76,0.1)', border: `1px solid ${idea.path === 'license' ? 'rgba(45,212,191,0.25)' : 'rgba(201,168,76,0.2)'}`, color: idea.path === 'license' ? '#2DD4BF' : '#C9A84C', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 7px', borderRadius: '4px', flexShrink: 0 }}>{idea.path}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.55', marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{idea.pitch}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.5)', letterSpacing: '0.08em' }}>{new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div style={{ color: '#4A4838', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>→</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
