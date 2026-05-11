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

type RevenuePath = {
  name: string
  description: string
  weekOne: string
  weekTwoToFour: string
  expectedRevenue: string
  risk: string
}

type Company = {
  name: string
  founded: string
  built: string
  outcome: 'Acquired' | 'Failed' | 'Pivoted' | 'Succeeded' | 'Still Running'
  what_happened: string
  lesson: string
}

const outcomeColor: Record<string, string> = {
  Acquired: '#2DD4BF',
  Failed: '#E07B8A',
  Pivoted: '#C9A84C',
  Succeeded: '#4ADE80',
  'Still Running': '#60A5FA',
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

  // Revenue paths state
  const [revenuePaths, setRevenuePaths] = useState<RevenuePath[] | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [revenueError, setRevenueError] = useState('')

  // Company comparison state
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState('')

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

  async function generateRevenuePaths() {
    if (!idea) return
    setRevenueLoading(true)
    setRevenueError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revenue_paths',
          payload: {
            brief: {
              pitch: idea.pitch,
              problem: idea.problem,
              solution: idea.solution,
              customer: idea.customer,
            },
          },
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to generate paths')
      setRevenuePaths(json.data.paths)
    } catch (e) {
      setRevenueError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setRevenueLoading(false)
  }

  async function generateCompanyComparison() {
    if (!idea) return
    setCompaniesLoading(true)
    setCompaniesError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'company_comparison',
          payload: {
            brief: {
              pitch: idea.pitch,
              problem: idea.problem,
              solution: idea.solution,
              customer: idea.customer,
            },
          },
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to generate comparison')
      setCompanies(json.data.companies)
    } catch (e) {
      setCompaniesError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setCompaniesLoading(false)
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

        {/* Idea Brief Card */}
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

        {/* Revenue Path Generator */}
        <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.16)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginBottom: '16px' }}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(45,212,191,0.04))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '6px' }}>◈ Revenue Path Generator</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: '#EEE8D8', marginBottom: '4px' }}>3 Ways to Make Money in 30 Days</div>
            <div style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.5' }}>Concrete paths to first revenue — specific to your idea, executable without a team or funding.</div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {!revenuePaths && !revenueLoading && (
              <button
                onClick={generateRevenuePaths}
                style={{ width: '100%', background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(226,192,106,0.08))', border: '1px solid rgba(201,168,76,0.3)', color: '#E2C06A', padding: '14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em' }}
              >
                Generate Revenue Paths
              </button>
            )}

            {revenueLoading && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#8E8B7A', fontSize: '13px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', color: '#C9A84C', marginBottom: '8px' }}>ANALYZING YOUR IDEA</div>
                Finding your fastest paths to revenue…
              </div>
            )}

            {revenueError && (
              <div style={{ color: '#E07B8A', fontSize: '12px', padding: '12px', background: 'rgba(224,123,138,0.08)', borderRadius: '8px', marginBottom: '12px' }}>{revenueError}</div>
            )}

            {revenuePaths && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {revenuePaths.map((path, i) => (
                  <div key={i} style={{ background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(201,168,76,0.07), transparent)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#111923', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: '600', color: '#EEE8D8' }}>{path.name}</div>
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#B8B4A4', lineHeight: '1.6' }}>{path.description}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2DD4BF', marginBottom: '5px' }}>Week 1</div>
                          <div style={{ fontSize: '12px', color: '#C8C4B4', lineHeight: '1.5' }}>{path.weekOne}</div>
                        </div>
                        <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2DD4BF', marginBottom: '5px' }}>Weeks 2–4</div>
                          <div style={{ fontSize: '12px', color: '#C8C4B4', lineHeight: '1.5' }}>{path.weekTwoToFour}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.14)', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4ADE80', marginBottom: '5px' }}>Expected Revenue</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#4ADE80' }}>{path.expectedRevenue}</div>
                        </div>
                        <div style={{ flex: 2, background: 'rgba(224,123,138,0.06)', border: '1px solid rgba(224,123,138,0.14)', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E07B8A', marginBottom: '5px' }}>Main Risk</div>
                          <div style={{ fontSize: '12px', color: '#C8C4B4', lineHeight: '1.5' }}>{path.risk}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setRevenuePaths(null); generateRevenuePaths() }}
                  style={{ background: 'none', border: '1px solid rgba(201,168,76,0.15)', color: '#8E8B7A', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Regenerate Paths
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Honest Company Comparison */}
        <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.16)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginBottom: '16px' }}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(224,123,138,0.06), rgba(201,168,76,0.04))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#E07B8A', marginBottom: '6px' }}>◉ Honest Comparison</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: '#EEE8D8', marginBottom: '4px' }}>What Happened to Similar Companies</div>
            <div style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.5' }}>Real outcomes from companies that built in your space — the good, the pivots, and the failures. Learn before you repeat them.</div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {!companies && !companiesLoading && (
              <button
                onClick={generateCompanyComparison}
                style={{ width: '100%', background: 'linear-gradient(135deg, rgba(224,123,138,0.1), rgba(224,123,138,0.05))', border: '1px solid rgba(224,123,138,0.25)', color: '#E07B8A', padding: '14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em' }}
              >
                Show Honest Comparison
              </button>
            )}

            {companiesLoading && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#8E8B7A', fontSize: '13px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', color: '#E07B8A', marginBottom: '8px' }}>RESEARCHING SIMILAR COMPANIES</div>
                Pulling real outcomes from companies in your space…
              </div>
            )}

            {companiesError && (
              <div style={{ color: '#E07B8A', fontSize: '12px', padding: '12px', background: 'rgba(224,123,138,0.08)', borderRadius: '8px', marginBottom: '12px' }}>{companiesError}</div>
            )}

            {companies && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {companies.map((company, i) => (
                  <div key={i} style={{ background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: '600', color: '#EEE8D8' }}>{company.name}</span>
                          {company.founded !== 'Unknown' && (
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(201,168,76,0.4)' }}>est. {company.founded}</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8E8B7A', marginTop: '2px', lineHeight: '1.4' }}>{company.built}</div>
                      </div>
                      <div style={{ flexShrink: 0, padding: '3px 9px', borderRadius: '20px', background: `${outcomeColor[company.outcome]}18`, border: `1px solid ${outcomeColor[company.outcome]}30`, fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: outcomeColor[company.outcome] }}>
                        {company.outcome}
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#B8B4A4', lineHeight: '1.6' }}>{company.what_happened}</div>
                      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '7px', padding: '8px 11px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#C9A84C', flexShrink: 0, marginTop: '1px' }}>LESSON</span>
                        <span style={{ fontSize: '12px', color: '#C8C4B4', lineHeight: '1.5' }}>{company.lesson}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setCompanies(null); generateCompanyComparison() }}
                  style={{ background: 'none', border: '1px solid rgba(201,168,76,0.15)', color: '#8E8B7A', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Regenerate Comparison
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
