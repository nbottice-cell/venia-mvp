'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'roles' | 'basics' | 'credentials' | 'done'

const CATEGORIES = [
  { id: 'engineers',     label: 'Engineer',                icon: '💻', desc: 'You build software, hardware, or technical systems.' },
  { id: 'designers',     label: 'Designer',                icon: '🎨', desc: 'You design products, experiences, or visual identities.' },
  { id: 'manufacturers', label: 'Manufacturer',            icon: '🏭', desc: 'You produce or can source physical products.' },
  { id: 'marketers',     label: 'Marketer',                icon: '📢', desc: 'You grow audiences, brands, or drive customer acquisition.' },
  { id: 'lawyers',       label: 'Lawyer',                  icon: '⚖️', desc: 'You provide legal services to founders or companies.' },
  { id: 'investors',     label: 'Investor',                icon: '💰', desc: 'You provide funding or capital to early-stage ventures.' },
  { id: 'team',          label: 'Co-Founder / Team Member', icon: '🤝', desc: 'You want to co-found or join an early-stage team.' },
  { id: 'corporations',  label: 'Corporation',             icon: '🏢', desc: 'Your company scouts, licenses, or acquires innovations.' },
]

const OPEN_TO_OPTIONS = [
  'Equity', 'Paid', 'Co-founder', 'Advisory', 'Investment', 'Licensing', 'Acquisition', 'Open to discuss',
]

const CATEGORY_PROMPTS: Record<string, { q: string; placeholder: string }[]> = {
  engineers: [
    { q: 'What technologies and stacks are you most experienced with?', placeholder: 'e.g. React, Python, Swift, embedded systems, AWS…' },
    { q: 'What is the most technically challenging problem you have shipped a solution for?', placeholder: 'Walk us through it briefly.' },
  ],
  designers: [
    { q: 'What type of design work do you specialize in?', placeholder: 'e.g. Product UX, brand identity, industrial design, motion…' },
    { q: 'Describe a project where your design made a real difference.', placeholder: 'What was the problem and what did you create?' },
  ],
  manufacturers: [
    { q: 'What categories of products do you manufacture or source?', placeholder: 'e.g. Apparel, electronics, packaging, food-grade…' },
    { q: 'What is your typical minimum order quantity and lead time?', placeholder: 'Help founders understand how to work with you.' },
  ],
  marketers: [
    { q: 'What marketing channels and strategies are you strongest in?', placeholder: 'e.g. Paid social, SEO, content, partnerships…' },
    { q: 'Describe a growth result you have driven that you are proud of.', placeholder: 'Be specific — numbers help.' },
  ],
  lawyers: [
    { q: 'What areas of law do you specialize in for founders?', placeholder: 'e.g. IP, patents, corporate formation, licensing…' },
    { q: 'What is the most common legal mistake you see early-stage founders make?', placeholder: 'Share something genuinely useful.' },
  ],
  investors: [
    { q: 'What stage and sectors do you typically invest in?', placeholder: 'e.g. Pre-seed consumer, Series A SaaS…' },
    { q: 'What do you look for most in a founder or idea?', placeholder: 'What signals tell you something is worth backing?' },
  ],
  team: [
    { q: 'What skills or experience do you bring to an early team?', placeholder: 'e.g. Operations, sales, product management, finance…' },
    { q: 'What kind of idea or mission would make you say yes immediately?', placeholder: 'What gets you excited enough to go all in?' },
  ],
  corporations: [
    { q: 'What types of innovations or ideas is your company actively looking to license?', placeholder: 'Be specific about the domains and problem areas.' },
    { q: 'What does your licensing or acquisition process look like for innovators?', placeholder: 'Help inventors understand how to approach you.' },
  ],
}

export default function ListYourselfPage() {
  return (
    <Suspense>
      <ListYourselfInner />
    </Suspense>
  )
}

function ListYourselfInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === '1'

  const [step, setStep] = useState<Step>('roles')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [openTo, setOpenTo] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleCategory(id: string) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function toggleOpenTo(opt: string) {
    setOpenTo(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])
  }

  function setAnswer(catId: string, idx: number, val: string) {
    setAnswers(prev => {
      const arr = [...(prev[catId] || [])]
      arr[idx] = val
      return { ...prev, [catId]: arr }
    })
  }

  async function save() {
    if (!displayName.trim()) { setError('Please enter a display name.'); return }
    setSaving(true)
    setError('')
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }

      const specialtiesArr = specialties.split(',').map(s => s.trim()).filter(Boolean)

      const { error: insertError } = await supabase.from('connect_profiles').insert({
        user_id: userData.user.id,
        display_name: displayName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        categories: selectedCategories,
        specialties: specialtiesArr,
        location: location.trim(),
        open_to: openTo,
        website: website.trim(),
        verified: false,
      })

      if (insertError) throw new Error(insertError.message)

      // Save user_type to profiles table
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        full_name: userData.user.user_metadata?.full_name || '',
        user_type: 'cofounder',
      })

      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // ── STYLES ──
  const wrap = { maxWidth: '680px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative' as const, zIndex: 1 }
  const card = { background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', marginBottom: '16px' }
  const eyebrow: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '10px' }
  const h1: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.25', marginBottom: '10px' }
  const sub: React.CSSProperties = { color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', marginBottom: '28px' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: '1.65', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '13px 28px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '12px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }

  const steps: Step[] = ['roles', 'basics', 'credentials']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button
          onClick={() => step === 'roles' ? router.push(isOnboarding ? '/auth' : '/connect') : setStep(steps[stepIndex - 1] || 'roles')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>
          {isOnboarding ? 'Build Your Profile' : 'List Yourself'}
        </div>
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: '5px' }}>
            {steps.map(s => (
              <div key={s} style={{ width: step === s ? '18px' : '6px', height: '6px', borderRadius: '3px', background: step === s ? '#C9A84C' : 'rgba(201,168,76,0.2)', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
      </nav>

      <div style={wrap}>

        {/* ── STEP 1: CATEGORIES / ROLES ── */}
        {step === 'roles' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 1 of 3</div>
            <h1 style={h1}>What best <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>describes you?</em></h1>
            <p style={sub}>Select all that apply. You will appear in the corresponding directories and unlock specific credential prompts.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '9px', marginBottom: '28px' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  style={{ background: selectedCategories.includes(cat.id) ? 'rgba(201,168,76,0.1)' : 'rgba(17,25,35,0.6)', border: `1px solid ${selectedCategories.includes(cat.id) ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '22px', marginBottom: '8px' }}>{cat.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedCategories.includes(cat.id) ? '#EEE8D8' : '#8E8B7A', marginBottom: '4px' }}>{cat.label}</div>
                  <div style={{ fontSize: '11px', color: '#4A4838', lineHeight: '1.4' }}>{cat.desc}</div>
                  {selectedCategories.includes(cat.id) && <div style={{ marginTop: '8px', color: '#C9A84C', fontSize: '11px', fontWeight: '600' }}>✓ Selected</div>}
                </button>
              ))}
            </div>
            <button onClick={() => selectedCategories.length > 0 && setStep('basics')} disabled={selectedCategories.length === 0}
              style={{ ...goldBtn, width: '100%', opacity: selectedCategories.length > 0 ? 1 : 0.4 }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: BASICS ── */}
        {step === 'basics' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 2 of 3</div>
            <h1 style={h1}>Tell people <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>who you are.</em></h1>
            <p style={sub}>This is how you will appear in the directory.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Display name *</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder='Your name, alias, or company name' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder='e.g. "Full-stack engineer · 8 yrs building consumer apps"' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder='A short paragraph about your background, what you do, and what kind of projects excite you.' rows={4} style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder='City, State or Remote' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder='https://' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Specialties <span style={{ opacity: 0.5 }}>(comma-separated)</span></label>
                <input value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder='e.g. React, iOS, Machine Learning, Brand Identity' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={labelStyle}>Open to</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {OPEN_TO_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => toggleOpenTo(opt)}
                      style={{ padding: '7px 14px', borderRadius: '20px', border: `1px solid ${openTo.includes(opt) ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, background: openTo.includes(opt) ? 'rgba(201,168,76,0.1)' : 'transparent', color: openTo.includes(opt) ? '#C9A84C' : '#8E8B7A', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s' }}>
                      {openTo.includes(opt) ? '✓ ' : ''}{opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('roles')} style={ghostBtn}>← Back</button>
              <button onClick={() => displayName.trim() && setStep('credentials')} disabled={!displayName.trim()}
                style={{ ...goldBtn, flex: 1, opacity: displayName.trim() ? 1 : 0.4 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: CREDENTIALS ── */}
        {step === 'credentials' && (
          <div>
            <div style={{ ...card, marginBottom: '16px' }}>
              <div style={eyebrow}>◈ Step 3 of 3</div>
              <h1 style={h1}>Share your <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>credentials.</em></h1>
              <p style={{ ...sub, marginBottom: 0 }}>Answer the prompts for each category you selected. These help founders understand exactly what you bring.</p>
            </div>
            {selectedCategories.map(catId => {
              const catMeta = CATEGORIES.find(c => c.id === catId)
              const prompts = CATEGORY_PROMPTS[catId] || []
              return (
                <div key={catId} style={{ ...card, marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '22px' }}>{catMeta?.icon}</span>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: '#EEE8D8', fontWeight: '600' }}>{catMeta?.label}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {prompts.map((prompt, idx) => (
                      <div key={idx}>
                        <label style={labelStyle}>{prompt.q}</label>
                        <textarea value={answers[catId]?.[idx] || ''} onChange={e => setAnswer(catId, idx, e.target.value)} placeholder={prompt.placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {error && <div style={{ color: '#E07B8A', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('basics')} style={ghostBtn}>← Back</button>
              <button onClick={save} disabled={saving} style={{ ...goldBtn, flex: 1, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Creating your profile…' : 'Create My Profile →'}
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ ...card, textAlign: 'center', padding: '56px 32px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✦</div>
            <h1 style={{ ...h1, textAlign: 'center' }}>You&apos;re listed.</h1>
            <p style={{ ...sub, textAlign: 'center', maxWidth: '380px', margin: '0 auto 32px' }}>
              Your profile is now visible in the Connect directory. Founders and collaborators can find you and reach out.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/welcome')} style={goldBtn}>Go to Venia →</button>
              {!isOnboarding && <button onClick={() => router.push('/connect')} style={ghostBtn}>Browse Connect</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
