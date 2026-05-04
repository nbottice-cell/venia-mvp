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

export default function NewJournalEntry() {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const [font, setFont] = useState(FONTS[0].value)
  const [saving, setSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showHighlights, setShowHighlights] = useState(false)
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false })

  // Current date/time — captured once on mount
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Track active format states on selection change
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
    const text = editorRef.current?.innerText || ''
    setWordCount(text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0)
  }

  const save = useCallback(async () => {
    const html = editorRef.current?.innerHTML || ''
    const text = editorRef.current?.innerText || ''
    if (!text.trim() || saving) return
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ user_id: userData.user.id, content: html })
        .select()
        .single()
      if (error) throw error
      router.push(`/journal/${data.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      alert('Could not save: ' + msg)
      setSaving(false)
    }
  }, [saving, router])

  // Cmd/Ctrl+S to save
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [save])

  const fmtBtn = (active: boolean): React.CSSProperties => ({
    width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700',
    background: active ? 'rgba(201,168,76,0.18)' : 'transparent',
    color: active ? '#C9A84C' : '#6B7280', transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FEFDF9', fontFamily: font }}>
      <style>{`
        .journal-editor:empty:before {
          content: 'Start writing…';
          color: #C4BDB0;
          pointer-events: none;
        }
        .journal-editor:focus { outline: none; }
        .journal-editor * { font-family: inherit; }
      `}</style>

      {/* TOOLBAR NAV */}
      <nav style={{ height: '50px', background: 'rgba(254,253,249,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '6px', position: 'sticky', top: 0, zIndex: 50 }}>

        {/* Back */}
        <button
          onClick={() => router.push('/journal')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", marginRight: '4px', whiteSpace: 'nowrap' }}
        >
          ← Journal
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />

        {/* Font selector */}
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#4B5563', background: 'transparent', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none' }}
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', margin: '0 2px' }} />

        {/* Bold */}
        <button
          onMouseDown={(e) => { e.preventDefault(); format('bold') }}
          style={fmtBtn(activeFormats.bold)}
          title="Bold (⌘B)"
        >
          <strong>B</strong>
        </button>

        {/* Italic */}
        <button
          onMouseDown={(e) => { e.preventDefault(); format('italic') }}
          style={fmtBtn(activeFormats.italic)}
          title="Italic (⌘I)"
        >
          <em>I</em>
        </button>

        {/* Underline */}
        <button
          onMouseDown={(e) => { e.preventDefault(); format('underline') }}
          style={fmtBtn(activeFormats.underline)}
          title="Underline (⌘U)"
        >
          <u>U</u>
        </button>

        {/* Highlight */}
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
                <button
                  key={h.value}
                  onMouseDown={(e) => { e.preventDefault(); applyHighlight(h.value) }}
                  title={h.label}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', background: h.value, border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer' }}
                />
              ))}
              <button
                onMouseDown={(e) => { e.preventDefault(); clearHighlight() }}
                title="Remove highlight"
                style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Word count */}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.04em' }}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>

        {/* Save */}
        <button
          onClick={save}
          disabled={wordCount === 0 || saving}
          style={{ background: wordCount === 0 ? 'rgba(201,168,76,0.25)' : 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: wordCount === 0 ? 'default' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif' }}>
          {saving ? 'Saving…' : 'Save →'}
        </button>
      </nav>

      {/* PAGE */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '52px 40px 120px' }}>
        {/* Date + Time */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#B0A898', letterSpacing: '0.08em', marginBottom: '40px' }}>
          {dateLabel} · {timeLabel}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="journal-editor"
          onInput={onInput}
          style={{ minHeight: '60vh', fontSize: '17px', lineHeight: '1.85', color: '#1F2937', fontFamily: 'inherit', caretColor: '#C9A84C' }}
        />
      </div>
    </div>
  )
}
