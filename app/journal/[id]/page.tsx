'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const FONTS = [
  { label: 'Journal',    value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Editorial',  value: "'Playfair Display', serif" },
  { label: 'Classic',    value: 'Georgia, serif' },
  { label: 'Typewriter', value: "'Courier New', monospace" },
]

const HIGHLIGHTS = [
  { label: 'Yellow', value: '#FFF9C4' },
  { label: 'Mint',   value: '#C8F7C5' },
  { label: 'Pink',   value: '#FADADD' },
  { label: 'Sky',    value: '#BBDEFB' },
]

type Brief = {
  names: string[]
  pitch: string
  problem: string
  solution: string
  customer: string
  whyNow: string
  unfairAdvantage: string
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

function stripHTML(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function EntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const editorRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const [font, setFont] = useState(FONTS[0].value)
  const [entryDate, setEntryDate] = useState('')
  const [entryTime, setEntryTime] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [savedLabel, setSavedLabel] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const [showHighlights, setShowHighlights] = useState(false)
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false })

  const [generatingBrief, setGeneratingBrief] = useState(false)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [selectedName, setSelectedName] = useState('')

  // Load entry
  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single()

      if (error || !data) { setNotFound(true); return }

      const created = new Date(data.created_at)
      setEntryDate(created.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
      setEntryTime(created.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))

      if (editorRef.current) {
        editorRef.current.innerHTML = data.content || ''
        const text = editorRef.current.innerText || ''
        setWordCount(text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0)
      }
      setLoaded(true)
    }
    load()
  }, [id, router])

  // Track format states
  useEffect(() => {
    function onSelectionChange() {
      setActiveFormats({
        bold:      document.queryCommandState('bold'),
        italic:    document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      })
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [])

  // Close highlight picker on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlights(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function format(command: string, value?: string) {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  function applyHighlight(color: string) {
    document.execCommand('hiliteColor', false, color)
    editorRef.current?.focus()
    setShowHighlights(false)
  }

  function clearHighlight() {
    document.execCommand('hiliteColor', false, 'transparent')
    editorRef.current?.focus()
    setShowHighlights(false)
  }

  function onInput() {
    setIsDirty(true)
    setSavedLabel('')
    const text = editorRef.current?.innerText || ''
    setWordCount(text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0)
  }

  const save = useCallback(async () => {
    const html = editorRef.current?.innerHTML || ''
    if (saving) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ content: html })
        .eq('id', id)
      if (error) throw error
      setIsDirty(false)
      setSavedLabel('Saved ✓')
      setTimeout(() => setSavedLabel(''), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      alert('Could not save: ' + msg)
    } finally {
      setSaving(false)
    }
  }, [saving, id])

  // Cmd/Ctrl+S to save
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) save()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [save, isDirty])

  async function generateBrief() {
    const text = stripHTML(editorRef.current?.innerHTML || '')
    if (!text.trim() || generatingBrief) return
    setGeneratingBrief(true)
    setBrief(null)
    try {
      const result = await aiCall('journal_to_brief', { content: text })
      const b = result as Brief
      setBrief(b)
      setSelectedName(b.names?.[0] || '')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      alert('Could not generate brief: ' + msg)
    } finally {
      setGeneratingBrief(false)
    }
  }

  const fmtBtn = (active: boolean): React.CSSProperties => ({
    width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700',
    background: active ? 'rgba(201,168,76,0.18)' : 'transparent',
    color: active ? '#C9A84C' : '#6B7280', transition: 'all 0.15s',
  })

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#FEFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#1A2332', marginBottom: '10px' }}>Entry not found.</div>
          <button onClick={() => router.push('/journal')} style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>← Back to Journal</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FEFDF9', fontFamily: font }}>
      <style>{`
        .journal-editor:focus { outline: none; }
        .journal-editor * { font-family: inherit; }
      `}</style>

      {/* TOOLBAR NAV */}
      <nav style={{ height: '50px', background: 'rgba(254,253,249,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '6px', position: 'sticky', top: 0, zIndex: 50 }}>

        <button
          onClick={() => router.push('/journal')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", marginRight: '4px', whiteSpace: 'nowrap' }}
        >
          ← Journal
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />

        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#4B5563', background: 'transparent', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none' }}
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', margin: '0 2px' }} />

        <button onMouseDown={(e) => { e.preventDefault(); format('bold') }} style={fmtBtn(activeFormats.bold)} title="Bold (⌘B)">
          <strong>B</strong>
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); format('italic') }} style={fmtBtn(activeFormats.italic)} title="Italic (⌘I)">
          <em>I</em>
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); format('underline') }} style={fmtBtn(activeFormats.underline)} title="Underline (⌘U)">
          <u>U</u>
        </button>

        <div ref={highlightRef} style={{ position: 'relative' }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowHighlights(p => !p) }}
            style={{ ...fmtBtn(false), width: 'auto', padding: '0 8px', gap: '4px', fontSize: '12px' }}
            title="Highlight"
          >
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#FFF9C4', border: '1px solid rgba(0,0,0,0.15)' }} />
            H
          </button>
          {showHighlights && (
            <div style={{ position: 'absolute', top: '38px', left: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px', padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100 }}>
              {HIGHLIGHTS.map(h => (
                <button key={h.value} onMouseDown={(e) => { e.preventDefault(); applyHighlight(h.value) }} title={h.label}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', background: h.value, border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer' }} />
              ))}
              <button onMouseDown={(e) => { e.preventDefault(); clearHighlight() }} title="Remove highlight"
                style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.04em' }}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>

        {savedLabel && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#4ADE80', letterSpacing: '0.04em' }}>
            {savedLabel}
          </span>
        )}

        {isDirty && (
          <button
            onClick={save}
            disabled={saving}
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {saving ? 'Saving…' : 'Save →'}
          </button>
        )}
      </nav>

      {/* PAGE */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '52px 40px 80px' }}>
        {/* Date + Time */}
        {loaded && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#B0A898', letterSpacing: '0.08em', marginBottom: '40px' }}>
            {entryDate} · {entryTime}
          </div>
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={loaded}
          suppressContentEditableWarning
          className="journal-editor"
          onInput={onInput}
          style={{ minHeight: '40vh', fontSize: '17px', lineHeight: '1.85', color: '#1F2937', fontFamily: 'inherit', caretColor: '#C9A84C' }}
        />

        {/* AI BRIEF SECTION */}
        {loaded && (
          <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            {!brief && !generatingBrief && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B0A898', marginBottom: '10px' }}>
                  ✦ AI
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#1A2332', marginBottom: '8px' }}>
                  Is there a business idea in here?
                </h3>
                <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', maxWidth: '360px', margin: '0 auto 20px' }}>
                  Let AI read this entry and extract the strongest idea thread into a full Idea Brief.
                </p>
                <button
                  onClick={generateBrief}
                  disabled={wordCount === 0}
                  style={{ background: wordCount === 0 ? 'rgba(201,168,76,0.25)' : 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 28px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: wordCount === 0 ? 'default' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: wordCount === 0 ? 'none' : '0 4px 14px rgba(201,168,76,0.25)' }}
                >
                  Generate Idea Brief →
                </button>
              </div>
            )}

            {generatingBrief && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', animation: `bounce 1.4s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#B0A898', letterSpacing: '0.08em' }}>
                  Reading your entry…
                </div>
                <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
              </div>
            )}

            {brief && (
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '8px' }}>
                  ✨ Idea Brief
                </div>

                {/* Name picker */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {brief.names.map(name => (
                    <button
                      key={name}
                      onClick={() => setSelectedName(name)}
                      style={{ padding: '7px 14px', borderRadius: '8px', background: selectedName === name ? 'rgba(201,168,76,0.12)' : '#F5F2EC', border: `1px solid ${selectedName === name ? 'rgba(201,168,76,0.40)' : 'rgba(0,0,0,0.10)'}`, color: selectedName === name ? '#C9A84C' : '#6B7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                {/* Brief card */}
                <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                  <div style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.07), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#EEE8D8', marginBottom: '6px' }}>
                      {selectedName}
                    </div>
                    <p style={{ fontSize: '14px', color: '#C8C4B4', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}>{brief.pitch}</p>
                  </div>
                  <div style={{ padding: '24px' }}>
                    {[
                      { label: 'The Problem',         text: brief.problem },
                      { label: 'The Solution',         text: brief.solution },
                      { label: 'Who It Is For',        text: brief.customer },
                      { label: 'Why Now',              text: brief.whyNow },
                      { label: 'Your Unfair Advantage',text: brief.unfairAdvantage },
                    ].map((s, i, arr) => (
                      <div key={i} style={{ marginBottom: i < arr.length - 1 ? '18px' : 0, paddingBottom: i < arr.length - 1 ? '18px' : 0, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: '6px' }}>
                          {s.label}
                        </div>
                        <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.75', margin: 0 }}>{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={generateBrief}
                    style={{ flex: 1, background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '11px', borderRadius: '9px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => router.push('/launch')}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '11px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Develop this in Launch →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
