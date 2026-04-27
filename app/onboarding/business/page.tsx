'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'about' | 'goals' | 'licensing' | 'done'

const GOALS = [
  { id: 'license',    icon: '🏛️', label: 'License ideas',         desc: 'Acquire or license innovations from inventors.' },
  { id: 'talent',     icon: '🤝', label: 'Find talent & partners', desc: 'Source engineers, designers, marketers, and more.' },
  { id: 'invest',     icon: '💰', label: 'Invest in innovations',  desc: 'Fund early-stage ideas and take equity.' },
  { id: 'source',     icon: '🏭', label: 'Source & manufacture',   desc: 'Find manufacturing partners for physical products.' },
  { id: 'browse',     icon: '⬡',  label: 'Browse the ecosystem',   desc: 'Stay current on what is being built.' },
]

export default function BusinessOnboardingPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('about')
  const [companyName, setCompanyName] = useState('')
  const [companyDesc, setCompanyDesc] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [isLicensing, setIsLicensing] = useState<boolean | null>(null)
  const [licensingDomains, setLicensingDomains] = useState('')
  const [licensingProcess, setLicensingProcess] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleGoal(id: string) {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }

      // Save to profiles
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        full_name: userData.user.user_metadata?.full_name || companyName,
        user_type: 'business',
        bio: companyDesc,
      })

      // If they want licensing, create a corporation connect_profile
      if (isLicensing && companyName.trim()) {
        const specialties = licensingDomains.split(',').map(s => s.trim()).filter(Boolean)
        await supabase.from('connect_profiles').insert({
          user_id: userData.user.id,
          display_name: companyName.trim(),
          tagline: companyDesc.split('.')[0]?.trim() || '',
          bio: licensingProcess.trim() || companyDesc.trim(),
          categories: ['corporations'],
          specialties,
          open_to: ['Licensing', 'Acquisition'],
          verified: false,
        })
      }

      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // ── STYLES ──
  const card = { background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', marginBottom: '16px' }
  const eyebrow: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '10px' }
  const h1: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.25', marginBottom: '10px' }
  const sub: React.CSSProperties = { color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', marginBottom: '28px' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: '1.65', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '13px 28px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '12px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }

  const steps: Step[] = ['about', 'goals', 'licensing']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button
          onClick={() => stepIndex > 0 ? setStep(steps[stepIndex - 1]) : router.push('/auth')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>Business Setup</div>
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: '5px' }}>
            {steps.map(s => (
              <div key={s} style={{ width: step === s ? '18px' : '6px', height: '6px', borderRadius: '3px', background: step === s ? '#C9A84C' : 'rgba(201,168,76,0.2)', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── STEP 1: ABOUT ── */}
        {step === 'about' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 1 of 3</div>
            <h1 style={h1}>Tell us about <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>your business.</em></h1>
            <p style={sub}>This helps us show you the right content and match you with the right people.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Company name *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder='What is your company called?' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
              <div>
                <label style={labelStyle}>What does your company do?</label>
                <textarea value={companyDesc} onChange={e => setCompanyDesc(e.target.value)} placeholder='Describe what your company does and what industry you operate in.' rows={4} style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>
            </div>
            <button onClick={() => companyName.trim() && setStep('goals')} disabled={!companyName.trim()}
              style={{ ...goldBtn, width: '100%', opacity: companyName.trim() ? 1 : 0.4 }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: GOALS ── */}
        {step === 'goals' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 2 of 3</div>
            <h1 style={h1}>What are you <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>here to do?</em></h1>
            <p style={sub}>Select everything that applies. This shapes how Venia works for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '28px' }}>
              {GOALS.map(goal => (
                <button key={goal.id} onClick={() => toggleGoal(goal.id)}
                  style={{ background: selectedGoals.includes(goal.id) ? 'rgba(201,168,76,0.1)' : 'rgba(17,25,35,0.6)', border: `1px solid ${selectedGoals.includes(goal.id) ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{goal.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: selectedGoals.includes(goal.id) ? '#EEE8D8' : '#8E8B7A', marginBottom: '3px' }}>{goal.label}</div>
                    <div style={{ fontSize: '12px', color: '#4A4838', lineHeight: '1.5' }}>{goal.desc}</div>
                  </div>
                  {selectedGoals.includes(goal.id) && <span style={{ color: '#C9A84C', fontSize: '16px', flexShrink: 0 }}>✓</span>}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('about')} style={ghostBtn}>← Back</button>
              <button onClick={() => selectedGoals.length > 0 && setStep('licensing')} disabled={selectedGoals.length === 0}
                style={{ ...goldBtn, flex: 1, opacity: selectedGoals.length > 0 ? 1 : 0.4 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: LICENSING ── */}
        {step === 'licensing' && (
          <div style={card}>
            <div style={eyebrow}>◈ Step 3 of 3</div>
            <h1 style={h1}>Are you looking to <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>license ideas?</em></h1>
            <p style={sub}>If yes, we will list your company in the Corporations directory so inventors can find and pitch you directly.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
              {([
                { val: true,  label: 'Yes — we actively license or acquire innovations', icon: '✅' },
                { val: false, label: 'No — not right now',                                icon: '⏭️' },
              ] as { val: boolean; label: string; icon: string }[]).map(opt => (
                <button key={String(opt.val)} onClick={() => setIsLicensing(opt.val)}
                  style={{ background: isLicensing === opt.val ? 'rgba(201,168,76,0.1)' : 'rgba(17,25,35,0.6)', border: `1px solid ${isLicensing === opt.val ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isLicensing === opt.val ? '#EEE8D8' : '#8E8B7A' }}>{opt.label}</span>
                  {isLicensing === opt.val && <span style={{ marginLeft: 'auto', color: '#C9A84C' }}>✓</span>}
                </button>
              ))}
            </div>

            {isLicensing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px', padding: '20px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '12px' }}>
                <div>
                  <label style={labelStyle}>What domains or industries are you interested in? <span style={{ opacity: 0.5 }}>(comma-separated)</span></label>
                  <input value={licensingDomains} onChange={e => setLicensingDomains(e.target.value)} placeholder='e.g. Health & wellness, Consumer electronics, Sustainable packaging' style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
                <div>
                  <label style={labelStyle}>How should inventors approach you?</label>
                  <textarea value={licensingProcess} onChange={e => setLicensingProcess(e.target.value)} placeholder='Describe your process — what you need to see, how to submit an idea, what stage you typically engage at.' rows={4} style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
              </div>
            )}

            {error && <div style={{ color: '#E07B8A', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('goals')} style={ghostBtn}>← Back</button>
              <button onClick={save} disabled={isLicensing === null || saving}
                style={{ ...goldBtn, flex: 1, opacity: isLicensing === null || saving ? 0.4 : 1 }}>
                {saving ? 'Setting up…' : 'Finish Setup →'}
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ ...card, textAlign: 'center', padding: '56px 32px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✦</div>
            <h1 style={{ ...h1, textAlign: 'center' }}>
              {companyName ? <>{companyName} is on Venia.</> : <>You&apos;re all set.</>}
            </h1>
            <p style={{ ...sub, textAlign: 'center', maxWidth: '380px', margin: '0 auto 32px' }}>
              {isLicensing
                ? 'Your company is now listed in the Corporations directory. Inventors can find you and submit ideas directly.'
                : 'Your business profile is set up. Explore what is being built and find the right people to work with.'}
            </p>
            <button onClick={() => router.push('/welcome')} style={{ ...goldBtn, padding: '14px 36px' }}>
              Enter Venia →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
