'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type AccountType = 'individual' | 'business' | ''
type Step = 'account-type' | 'roles' | 'basics' | 'credentials' | 'done'

const ROLES = [
  { id: 'inventor',     label: 'Inventor',          icon: '💡', desc: 'You create original ideas and intellectual property.' },
  { id: 'businessman',  label: 'Businessman',        icon: '💼', desc: 'You have business, operations, or commercial experience.' },
  { id: 'investor',     label: 'Investor',           icon: '💰', desc: 'You provide funding or capital to early-stage ventures.' },
  { id: 'manufacturer', label: 'Manufacturer',       icon: '🏭', desc: 'You produce or can source physical products.' },
  { id: 'lawyer',       label: 'Lawyer',             icon: '⚖️', desc: 'You provide legal services to founders or companies.' },
  { id: 'marketer',     label: 'Marketer',           icon: '📢', desc: 'You grow audiences, brands, or drive customer acquisition.' },
  { id: 'designer',     label: 'Designer',           icon: '🎨', desc: 'You design products, experiences, or visual identities.' },
  { id: 'engineer',     label: 'Engineer',           icon: '💻', desc: 'You build software, hardware, or technical systems.' },
  { id: 'corporation',  label: 'Large Corporation',  icon: '🏢', desc: 'Your company scouts, licenses, or acquires innovations.' },
]

const OPEN_TO_OPTIONS = [
  'Equity', 'Paid', 'Co-founder', 'Advisory', 'Investment', 'Licensing', 'Acquisition', 'Open to discuss'
]

const ROLE_PROMPTS: Record<string, { q: string; placeholder: string }[]> = {
  inventor: [
    { q: 'What kinds of ideas do you typically develop?', placeholder: 'e.g. Consumer hardware, software tools, process patents…' },
    { q: 'What is your most notable invention or project so far?', placeholder: 'Tell us about something you built or created.' },
  ],
  businessman: [
    { q: 'What industries or domains do you have the most experience in?', placeholder: 'e.g. Retail, SaaS, logistics, finance…' },
    { q: 'What is the biggest commercial problem you have solved?', placeholder: 'Describe a business challenge you navigated.' },
  ],
  investor: [
    { q: 'What stage and sectors do you typically invest in?', placeholder: 'e.g. Pre-seed consumer, Series A SaaS…' },
    { q: 'What do you look for most in a founder or idea?', placeholder: 'What signals tell you something is worth backing?' },
  ],
  manufacturer: [
    { q: 'What categories of products do you manufacture or source?', placeholder: 'e.g. Apparel, electronics, packaging, food-grade…' },
    { q: 'What is your typical minimum order quantity and lead time?', placeholder: 'Help founders understand how to work with you.' },
  ],
  lawyer: [
    { q: 'What areas of law do you specialize in for founders?', placeholder: 'e.g. IP, patents, corporate formation, licensing…' },
    { q: 'What is the most common legal mistake you see early-stage founders make?', placeholder: 'Share something genuinely useful.' },
  ],
  marketer: [
    { q: 'What marketing channels and strategies are you strongest in?', placeholder: 'e.g. Paid social, SEO, content, partnerships…' },
    { q: 'Describe a growth result you have driven that you are proud of.', placeholder: 'Be specific — numbers help.' },
  ],
  designer: [
    { q: 'What type of design work do you specialize in?', placeholder: 'e.g. Product UX, brand identity, industrial design, motion…' },
    { q: 'Describe a project where your design made a real difference.', placeholder: 'What was the problem and what did you create?' },
  ],
  engineer: [
    { q: 'What technologies and stacks are you most experienced with?', placeholder: 'e.g. React, Python, Swift, embedded systems, AWS…' },
    { q: 'What is the most technically challenging problem you have shipped a solution for?', placeholder: 'Walk us through it briefly.' },
  ],
  corporation: [
    { q: 'What types of innovations or ideas is your company actively looking to license?', placeholder: 'Be specific about the domains and problem areas.' },
    { q: 'What does your licensing or acquisition process look like for innovators?', placeholder: 'Help inventors understand how to approach you.' },
  ],
}

// Map roles to connect_profiles categories
const ROLE_TO_CATEGORY: Record<string, string> = {
  inventor: 'team',
  businessman: 'team',
  investor: 'investors',
  manufacturer: 'manufacturers',
  lawyer: 'lawyers',
  marketer: 'marketers',
  designer: 'designers',
  engineer: 'engineers',
  corporation: 'corporations',
}

export default function ListYourselfPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('account-type')
  const [accountType, setAccountType] = useState<AccountType>('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [openTo, setOpenTo] = useState<string[]>([])
  const [roleAnswers, setRoleAnswers] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Collect all prompts across selected roles (deduplicated by question text)
  const allPrompts: { role: string; idx: number; q: string; placeholder: string }[] = []
  selectedRoles.forEach(role => {
    const prompts = ROLE_PROMPTS[role] || []
    prompts.forEach((p, idx) => {
      allPrompts.push({ role, idx, q: p.q, placeholder: p.placeholder })
    })
  })

  function toggleRole(id: string) {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  function toggleOpenTo(opt: string) {
    setOpenTo(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    )
  }

  function setAnswer(role: string, idx: number, val: string) {
    setRoleAnswers(prev => {
      const arr = [...(prev[role] || [])]
      arr[idx] = val
      return { ...prev, [role]: arr }
    })
  }

  async function save() {
    if (!displayName.trim()) { setError('Please enter a display name.'); return }
    if (selectedRoles.length === 0) { setError('Please select at least one role.'); return }
    setSaving(true)
    setError('')
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }

      // Build credentials blob from role answers
      const credentials: Record<string, { q: string; a: string }[]> = {}
      selectedRoles.forEach(role => {
        const prompts = ROLE_PROMPTS[role] || []
        credentials[role] = prompts.map((p, idx) => ({
          q: p.q,
          a: (roleAnswers[role]?.[idx] || ''),
        }))
      })

      // Derive categories from selected roles
      const categories = [...new Set(selectedRoles.map(r => ROLE_TO_CATEGORY[r]).filter(Boolean))]

      const specialtiesArr = specialties.split(',').map(s => s.trim()).filter(Boolean)

      const { error: insertError } = await supabase.from('connect_profiles').insert({
        user_id: userData.user.id,
        display_name: displayName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        categories,
        specialties: specialtiesArr,
        location: location.trim(),
        open_to: openTo,
        website: website.trim(),
        verified: false,
      })

      if (insertError) throw new Error(insertError.message)
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
  const label: React.CSSProperties = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '13px 28px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '12px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => step === 'account-type' ? router.push('/connect') : setStep('account-type')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>List Yourself</div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {(['account-type','roles','basics','credentials'] as Step[]).map(s => (
            <div key={s} style={{ width: step === s ? '18px' : '6px', height: '6px', borderRadius: '3px', background: step === s ? '#C9A84C' : 'rgba(201,168,76,0.2)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </nav>

      <div style={wrap}>

        {/* ── STEP 1: ACCOUNT TYPE ── */}
        {step === 'account-type' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 1 of 4</div>
            <h1 style={h1}>Are you listing as an <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>individual or a business?</em></h1>
            <p style={sub}>This helps us show your profile in the right context.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {([
                { id: 'individual', icon: '👤', label: 'Individual', desc: 'A person offering skills, services, or looking to collaborate.' },
                { id: 'business',   icon: '🏢', label: 'Business',   desc: 'A company, agency, firm, or organization.' },
              ] as { id: AccountType; icon: string; label: string; desc: string }[]).map(opt => (
                <button key={opt.id} onClick={() => setAccountType(opt.id)}
                  style={{ background: accountType === opt.id ? 'rgba(201,168,76,0.1)' : 'rgba(17,25,35,0.6)', border: `1px solid ${accountType === opt.id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '18px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: accountType === opt.id ? '#EEE8D8' : '#8E8B7A', marginBottom: '3px' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: '#4A4838', lineHeight: '1.5' }}>{opt.desc}</div>
                  </div>
                  {accountType === opt.id && <div style={{ marginLeft: 'auto', color: '#C9A84C', fontSize: '16px' }}>✓</div>}
                </button>
              ))}
            </div>
            <button onClick={() => accountType && setStep('roles')} disabled={!accountType} style={{ ...goldBtn, width: '100%', opacity: accountType ? 1 : 0.4 }}>Continue →</button>
          </div>
        )}

        {/* ── STEP 2: ROLES ── */}
        {step === 'roles' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 2 of 4</div>
            <h1 style={h1}>What roles <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>describe you?</em></h1>
            <p style={sub}>Select all that apply. Each role unlocks specific prompts to build your profile.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '9px', marginBottom: '28px' }}>
              {ROLES.map(role => (
                <button key={role.id} onClick={() => toggleRole(role.id)}
                  style={{ background: selectedRoles.includes(role.id) ? 'rgba(201,168,76,0.1)' : 'rgba(17,25,35,0.6)', border: `1px solid ${selectedRoles.includes(role.id) ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '22px', marginBottom: '8px' }}>{role.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedRoles.includes(role.id) ? '#EEE8D8' : '#8E8B7A', marginBottom: '4px' }}>{role.label}</div>
                  <div style={{ fontSize: '11px', color: '#4A4838', lineHeight: '1.4' }}>{role.desc}</div>
                  {selectedRoles.includes(role.id) && <div style={{ marginTop: '8px', color: '#C9A84C', fontSize: '12px', fontWeight: '600' }}>✓ Selected</div>}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('account-type')} style={ghostBtn}>← Back</button>
              <button onClick={() => selectedRoles.length > 0 && setStep('basics')} disabled={selectedRoles.length === 0} style={{ ...goldBtn, flex: 1, opacity: selectedRoles.length > 0 ? 1 : 0.4 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: BASICS ── */}
        {step === 'basics' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 3 of 4</div>
            <h1 style={h1}>Tell people <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>who you are.</em></h1>
            <p style={sub}>This is how you will appear in the directory.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
              <div>
                <label style={label}>Display name *</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={accountType === 'business' ? 'Your company name' : 'Your name or alias'} style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={label}>Tagline</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder='e.g. "Full-stack engineer · 8 yrs building consumer apps"' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={label}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder='A short paragraph about your background, what you do, and what kind of projects excite you.' rows={4} style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={label}>Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder='City, State or Remote' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
                <div>
                  <label style={label}>Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder='https://' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
              </div>
              <div>
                <label style={label}>Specialties <span style={{ opacity: 0.5 }}>(comma-separated)</span></label>
                <input value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder='e.g. React, iOS, Machine Learning, Brand Identity' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={label}>Open to</label>
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
              <button onClick={() => displayName.trim() && setStep('credentials')} disabled={!displayName.trim()} style={{ ...goldBtn, flex: 1, opacity: displayName.trim() ? 1 : 0.4 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: ROLE PROMPTS / CREDENTIALS ── */}
        {step === 'credentials' && (
          <div>
            <div style={{ ...card, marginBottom: '16px' }}>
              <div style={eyebrow}>◈ Step 4 of 4</div>
              <h1 style={h1}>Share your <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>credentials.</em></h1>
              <p style={{ ...sub, marginBottom: 0 }}>Answer the prompts for each of your roles. These help founders understand exactly what you bring to the table.</p>
            </div>

            {selectedRoles.map(roleId => {
              const roleMeta = ROLES.find(r => r.id === roleId)
              const prompts = ROLE_PROMPTS[roleId] || []
              return (
                <div key={roleId} style={{ ...card, marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '22px' }}>{roleMeta?.icon}</span>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: '#EEE8D8', fontWeight: '600' }}>{roleMeta?.label}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {prompts.map((prompt, idx) => (
                      <div key={idx}>
                        <label style={label}>{prompt.q}</label>
                        <textarea
                          value={roleAnswers[roleId]?.[idx] || ''}
                          onChange={e => setAnswer(roleId, idx, e.target.value)}
                          placeholder={prompt.placeholder}
                          rows={3}
                          style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties}
                          onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                        />
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
              Your profile is now visible in the Connect directory. Founders and collaborators can find you and send connection requests.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/connect')} style={goldBtn}>Back to Connect →</button>
              <button onClick={() => router.push('/welcome')} style={ghostBtn}>Home</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
