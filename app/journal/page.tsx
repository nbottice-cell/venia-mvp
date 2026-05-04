'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type JournalEntry = {
  id: string
  created_at: string
  content: string
}

type IdeaSuggestion = {
  title: string
  description: string
  connection: string
}

async function aiCall(action: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'AI call failed')
  return data.data
}

export default function JournalPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState('')
  const [saving, setSaving] = useState(false)
  const [synthesizing, setSynthesizing] = useState(false)
  const [ideas, setIdeas] = useState<IdeaSuggestion[] | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // ── STYLES ──
  const navStyle: React.CSSProperties = { height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }
  const wrap = { maxWidth: '720px', margin: '0 auto', padding: '36px 20px' }
  const card: React.CSSProperties = { background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', marginBottom: '16px' }
  const eyebrow: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '8px' }
  const h1: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '600', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '10px' }
  const sub: React.CSSProperties = { color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', marginBottom: '0' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }
  const label: React.CSSProperties = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 24px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(201,168,76,0.25)' }

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  async function saveEntry() {
    if (!newEntry.trim() || saving) return
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ user_id: userData.user.id, content: newEntry.trim() })
        .select()
        .single()
      if (error) throw error
      setEntries(prev => [data, ...prev])
      setNewEntry('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      alert('Could not save entry: ' + msg)
    } finally {
      setSaving(false)
    }
  }

  async function synthesize() {
    if (entries.length === 0 || synthesizing) return
    setSynthesizing(true)
    setIdeas(null)
    try {
      const entriesPayload = entries.map(e => ({
        date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: e.content,
      }))
      const result = await aiCall('synthesize_journal', { entries: entriesPayload })
      setIdeas((result as { ideas: IdeaSuggestion[] }).ideas)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      alert('Synthesis failed: ' + msg)
    } finally {
      setSynthesizing(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav style={navStyle}>
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Back
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }}>
          Journal
        </div>
        {entries.length > 0 && (
          <button
            onClick={synthesize}
            disabled={synthesizing}
            style={{ ...goldBtn, padding: '8px 16px', fontSize: '12px', opacity: synthesizing ? 0.7 : 1 }}
          >
            {synthesizing ? '✦ Synthesizing…' : '✦ AI Synthesis'}
          </button>
        )}
      </nav>

      <div style={wrap}>

        {/* HEADER */}
        <div style={card}>
          <div style={eyebrow}>✦ Idea Journal</div>
          <h1 style={h1}>Think out loud. <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>Patterns emerge.</em></h1>
          <p style={sub}>Write freely — observations, frustrations, sparks, anything. When you have a few entries, hit AI Synthesis and watch it surface the business idea hiding in your notes.</p>
        </div>

        {/* NEW ENTRY */}
        <div style={card}>
          <div style={eyebrow}>New Entry — {todayLabel}</div>
          <label style={label}>What is on your mind?</label>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Something I keep noticing… a problem nobody is solving… a skill I have that others lack… a moment that made me think…"
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' } as React.CSSProperties}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.4)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.15)' }}
          />
          <button
            onClick={saveEntry}
            disabled={!newEntry.trim() || saving}
            style={{ ...goldBtn, width: '100%', marginTop: '12px', opacity: !newEntry.trim() ? 0.4 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Entry →'}
          </button>
        </div>

        {/* AI SYNTHESIS RESULTS */}
        {(synthesizing || ideas) && (
          <div style={{ ...card, borderColor: 'rgba(201,168,76,0.30)' }}>
            <div style={eyebrow}>✨ AI Synthesis</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#EEE8D8', marginBottom: synthesizing ? '0' : '16px' }}>
              {synthesizing ? 'Reading your entries…' : 'Ideas hiding in your notes'}
            </h2>

            {synthesizing && (
              <div style={{ display: 'flex', gap: '6px', padding: '16px 0' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', animation: `bounce 1.4s ${i * 0.2}s infinite` }} />
                ))}
                <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
              </div>
            )}

            {ideas && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ideas.map((idea, i) => (
                  <div key={i} style={{ background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111923', fontWeight: '700', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>
                        {i + 1}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: '#EEE8D8', lineHeight: '1.35' }}>
                        {idea.title}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.7', marginBottom: '10px' }}>
                      {idea.description}
                    </p>
                    <div style={{ padding: '9px 12px', background: 'rgba(201,168,76,0.06)', borderRadius: '7px', borderLeft: '2px solid rgba(201,168,76,0.35)' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C' }}>From your notes: </span>
                      <span style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.6' }}>{idea.connection}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => router.push('/launch')} style={{ ...goldBtn, width: '100%', marginTop: '4px' }}>
                  Develop one of these in Launch →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ENTRIES LIST */}
        {!loading && entries.length === 0 && !synthesizing && !ideas && (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px', opacity: 0.5 }}>✍</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#EEE8D8', marginBottom: '8px' }}>Your journal is empty.</div>
            <div>Write your first entry above — ideas, frustrations, observations, anything.</div>
          </div>
        )}

        {entries.length > 0 && (
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)', marginBottom: '12px', paddingLeft: '4px' }}>
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </div>
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id
              return (
                <div
                  key={entry.id}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  style={{ ...card, cursor: 'pointer', padding: '20px 24px', transition: 'border-color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.14)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '8px' }}>
                        {formatDate(entry.created_at)}
                      </div>
                      <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.7', margin: 0, whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap', overflow: 'hidden', textOverflow: isExpanded ? 'unset' : 'ellipsis' }}>
                        {entry.content}
                      </p>
                    </div>
                    <div style={{ color: 'rgba(201,168,76,0.45)', fontSize: '11px', flexShrink: 0, marginTop: '18px' }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
