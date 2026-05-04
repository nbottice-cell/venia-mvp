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

function stripHTML(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(html: string) {
  const text = stripHTML(html)
  return text ? text.split(/\s+/).filter(Boolean).length : 0
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

export default function JournalHome() {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [synthesizing, setSynthesizing] = useState(false)
  const [ideas, setIdeas] = useState<IdeaSuggestion[] | null>(null)

  // ── STYLES ──
  const navStyle: React.CSSProperties = {
    height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', padding: '0 24px', gap: '10px',
    position: 'sticky', top: 0, zIndex: 50,
  }
  const wrap = { maxWidth: '760px', margin: '0 auto', padding: '36px 20px' }
  const card: React.CSSProperties = {
    background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px',
    padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', marginBottom: '12px',
    cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s',
  }
  const goldBtn: React.CSSProperties = {
    background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none',
    padding: '9px 18px', borderRadius: '9px', fontSize: '12px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: '0 4px 14px rgba(201,168,76,0.25)', whiteSpace: 'nowrap' as const,
  }

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

  async function synthesize() {
    if (entries.length < 2 || synthesizing) return
    setSynthesizing(true)
    setIdeas(null)
    try {
      const entriesPayload = entries.map(e => ({
        date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: stripHTML(e.content),
      }))
      const result = await aiCall('synthesize_journal', { entries: entriesPayload })
      setIdeas((result as { ideas: IdeaSuggestion[] }).ideas)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      alert('Pattern analysis failed: ' + msg)
    } finally {
      setSynthesizing(false)
    }
  }

  function formatEntryDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  function formatEntryTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav style={navStyle}>
        <button
          onClick={() => router.push('/welcome')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}
        >
          ← Back
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }}>
          Journal
        </div>
        {entries.length >= 2 && (
          <button onClick={synthesize} disabled={synthesizing} style={{ ...goldBtn, background: synthesizing ? 'rgba(201,168,76,0.3)' : goldBtn.background as string, boxShadow: synthesizing ? 'none' : goldBtn.boxShadow as string }}>
            {synthesizing ? '✦ Analyzing…' : '✦ Find Patterns'}
          </button>
        )}
        <button onClick={() => router.push('/journal/new')} style={goldBtn}>
          + New Entry
        </button>
      </nav>

      <div style={wrap}>

        {/* PATTERN ANALYSIS RESULTS */}
        {(synthesizing || ideas) && (
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.30)', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '8px' }}>
              ✨ AI Pattern Analysis
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: synthesizing ? '0' : '20px' }}>
              {synthesizing ? 'Reading all your entries…' : 'Ideas hiding across your notes'}
            </h2>

            {synthesizing && (
              <div style={{ display: 'flex', gap: '6px', padding: '14px 0' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', animation: `bounce 1.4s ${i * 0.2}s infinite` }} />
                ))}
                <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
              </div>
            )}

            {ideas && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ideas.map((idea, i) => (
                  <div key={i} style={{ background: 'rgba(17,25,35,0.7)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111923', fontWeight: '700', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>
                        {i + 1}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: '#EEE8D8', lineHeight: '1.35' }}>
                        {idea.title}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.75', marginBottom: '10px', paddingLeft: '40px' }}>
                      {idea.description}
                    </p>
                    <div style={{ marginLeft: '40px', padding: '8px 12px', background: 'rgba(201,168,76,0.06)', borderRadius: '7px', borderLeft: '2px solid rgba(201,168,76,0.4)' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C' }}>From your notes: </span>
                      <span style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.6' }}>{idea.connection}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => router.push('/launch')} style={{ ...goldBtn, padding: '12px 24px', fontSize: '13px', width: '100%', marginTop: '4px' }}>
                  Develop one of these in Launch →
                </button>
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.35 }}>✍</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#1A2332', marginBottom: '10px' }}>
              Your journal is empty.
            </div>
            <p style={{ color: '#8E8B7A', fontSize: '14px', lineHeight: '1.65', maxWidth: '380px', margin: '0 auto 28px' }}>
              Write freely — observations, frustrations, sparks. The AI reads everything and surfaces ideas hiding in your notes.
            </p>
            <button onClick={() => router.push('/journal/new')} style={{ ...goldBtn, padding: '13px 28px', fontSize: '14px' }}>
              Write your first entry →
            </button>
          </div>
        )}

        {/* ENTRIES LIST */}
        {!loading && entries.length > 0 && (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)', marginBottom: '14px', paddingLeft: '2px' }}>
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </div>

            {entries.map(entry => {
              const preview = stripHTML(entry.content)
              const wc = wordCount(entry.content)
              return (
                <div
                  key={entry.id}
                  style={card}
                  onClick={() => router.push(`/journal/${entry.id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.30)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.14)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '2px' }}>
                        {formatEntryDate(entry.created_at)}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.45)', letterSpacing: '0.08em' }}>
                        {formatEntryTime(entry.created_at)} · {wc} {wc === 1 ? 'word' : 'words'}
                      </div>
                    </div>
                    <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '13px' }}>→</div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.7', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {preview || <em style={{ color: '#4A5A6C' }}>(empty entry)</em>}
                  </p>
                </div>
              )
            })}

            {entries.length >= 2 && (
              <div style={{ marginTop: '24px', padding: '20px 24px', background: 'rgba(201,168,76,0.06)', border: '1px dashed rgba(201,168,76,0.25)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#1A2332', marginBottom: '6px' }}>
                  You have {entries.length} entries.
                </div>
                <p style={{ fontSize: '12px', color: '#8E8B7A', marginBottom: '14px', lineHeight: '1.6' }}>
                  Let AI read all of them together and find the business ideas hiding in the patterns.
                </p>
                <button onClick={synthesize} disabled={synthesizing} style={goldBtn}>
                  {synthesizing ? '✦ Finding Patterns…' : '✦ Find Patterns Across All Entries'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
