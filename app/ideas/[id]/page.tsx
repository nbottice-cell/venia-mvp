'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Idea = {
  id: string
  name: string
  pitch: string
  problem: string
  solution: string
  customer: string
  why_now: string
  unfair_advantage: string
  path: 'build' | 'license'
  framework: string
  status: string
  created_at: string
}

export default function IdeaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Partial<Idea>>({})

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single()
      if (error || !data) { setError('Idea not found.'); setLoading(false); return }
      setIdea(data)
      setEditing(data)
      setLoading(false)
    }
    load()
  }, [id, router])

  function update(field: keyof Idea, value: string) {
    setEditing(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function save() {
    if (!idea) return
    setSaving(true)
    const { error } = await supabase
      .from('ideas')
      .update({
        name: editing.name,
        pitch: editing.pitch,
        problem: editing.problem,
        solution: editing.solution,
        customer: editing.customer,
        why_now: editing.why_now,
        unfair_advantage: editing.unfair_advantage,
      })
      .eq('id', id)
    setSaving(false)
    if (!error) { setIdea(prev => prev ? { ...prev, ...editing } : prev); setSaved(true) }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 13px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: '1.65', resize: 'vertical' }
  const label: React.CSSProperties = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const section: React.CSSProperties = { marginBottom: '20px' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8B7A', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading…</div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E07B8A', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={{ height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/ideas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← My Ideas</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{editing.name || idea?.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saved && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#4ADE80', letterSpacing: '0.1em' }}>✓ Saved</span>}
          <button onClick={save} disabled={saving} style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.16)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginBottom: '16px' }}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(45,212,191,0.04))', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '6px' }}>✦ Idea Brief</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '13px', color: '#8E8B7A' }}>{idea?.framework} framework · {idea?.path === 'build' ? '⚡ Build Mode' : '🏛️ License Mode'}</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.06em' }}>{idea && new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={section}>
              <label style={label}>Idea Name</label>
              <input type="text" value={editing.name || ''} onChange={e => update('name', e.target.value)}
                style={{ ...inputStyle, fontSize: '18px', fontFamily: "'Playfair Display', serif", fontWeight: '600' }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
            </div>

            {([
              { key: 'pitch', label: 'One-Line Pitch', rows: 2 },
              { key: 'problem', label: 'The Problem', rows: 3 },
              { key: 'solution', label: 'The Solution', rows: 3 },
              { key: 'customer', label: 'Who It Is For', rows: 2 },
              { key: 'why_now', label: 'Why Now', rows: 2 },
              { key: 'unfair_advantage', label: 'Your Unfair Advantage', rows: 2 },
            ] as { key: keyof Idea, label: string, rows: number }[]).map(field => (
              <div key={field.key} style={section}>
                <label style={label}>{field.label}</label>
                <textarea
                  value={(editing[field.key] as string) || ''}
                  onChange={e => update(field.key, e.target.value)}
                  rows={field.rows}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                />
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.12)', display: 'flex', gap: '10px' }}>
            <button onClick={save} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
            <button onClick={() => router.push('/launch')} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '12px 20px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Start a New Idea</button>
          </div>
        </div>
      </div>
    </div>
  )
}
