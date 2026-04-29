'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type VerifyStage = 'info' | 'form' | 'pending'

export default function VerifyPage() {
  const router = useRouter()
  const [stage, setStage] = useState<VerifyStage>('info')
  const [fullName, setFullName] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [idType, setIdType] = useState('')
  const [idFile, setIdFile] = useState<string | null>(null)
  const [statement, setStatement] = useState('')
  const [role, setRole] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = fullName.trim() && linkedin.trim() && idType && idFile && role

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 13px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '13px 28px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '12px 22px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const card: React.CSSProperties = { background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', marginBottom: '16px' }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setStage('pending') }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #111923 0%, #18222E 60%, #1E2B3A 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav style={{ height: '52px', background: 'rgba(17,25,35,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky' as const, top: 0, zIndex: 50 }}>
        <button onClick={() => stage === 'form' ? setStage('info') : router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8B7A', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#EEE8D8', flex: 1 }}>Get Verified</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '6px', padding: '4px 10px' }}>
          <span style={{ color: '#4ADE80', fontSize: '10px' }}>✓</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4ADE80' }}>Identity Program</span>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── INFO STAGE ── */}
        {stage === 'info' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#4ADE80', marginBottom: '10px' }}>◆ Venia Verification</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.25', marginBottom: '12px' }}>
                Build trust with <em style={{ fontStyle: 'italic', color: '#4ADE80' }}>every interaction.</em>
              </h1>
              <p style={{ color: '#8E8B7A', fontSize: '14px', lineHeight: '1.7', maxWidth: '460px', margin: '0 auto' }}>
                Verified users get a badge that tells investors, co-founders, and partners: this is a real person with real intentions.
              </p>
            </div>

            {/* Tier cards */}
            {[
              {
                tier: 'Tier 1',
                name: 'Email Verified',
                status: 'active',
                icon: '✉',
                color: '#C9A84C',
                desc: 'Your email address has been confirmed. Every Venia account has this automatically.',
                items: ['Confirmed email address', 'Basic account access', 'Post ideas and browse'],
              },
              {
                tier: 'Tier 2',
                name: 'Identity Verified',
                status: 'available',
                icon: '🪪',
                color: '#4ADE80',
                desc: 'Prove you are a real person with a government-issued ID and LinkedIn profile. Reviewed by the Venia team within 48 hours.',
                items: ['Full name confirmation', 'Government ID review', 'LinkedIn profile match', 'Green verified badge on all listings', 'Priority visibility in Capital feed'],
              },
              {
                tier: 'Tier 3',
                name: 'Capital Verified',
                status: 'coming_soon',
                icon: '🏛️',
                color: '#A78BFA',
                desc: 'Required to send or receive real capital. Includes business registration, bank verification, and accredited investor certification where applicable.',
                items: ['Business registration (EIN / LLC docs)', 'Bank account verification via Plaid', 'Accredited investor self-certification', 'Legal identity confirmation', 'Full transactional access'],
              },
            ].map((tier) => (
              <div key={tier.tier} style={{ ...card, borderColor: tier.status === 'active' ? `rgba(201,168,76,0.3)` : tier.status === 'available' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: tier.status === 'coming_soon' ? 'rgba(255,255,255,0.04)' : `rgba(${tier.color === '#C9A84C' ? '201,168,76' : tier.color === '#4ADE80' ? '74,222,128' : '167,139,250'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{tier.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' as const }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.5)' }}>{tier.tier}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: tier.status === 'coming_soon' ? '#4A4838' : '#EEE8D8' }}>{tier.name}</div>
                      {tier.status === 'active' && <span style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '4px' }}>Active</span>}
                      {tier.status === 'coming_soon' && <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4A4838', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '4px' }}>Coming Soon</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.65', marginBottom: '12px' }}>{tier.desc}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {tier.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: tier.status === 'coming_soon' ? '#4A4838' : tier.color, flexShrink: 0 }} />
                          <div style={{ fontSize: '12px', color: tier.status === 'coming_soon' ? '#4A4838' : '#C5BBA8', lineHeight: '1.5' }}>{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setStage('form')} style={{ ...goldBtn, width: '100%', padding: '14px', fontSize: '14px' }}>
              Apply for Identity Verification →
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#4A4838', marginTop: '12px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
              Free · Reviewed within 48 hours · Your ID is never stored publicly
            </p>
          </>
        )}

        {/* ── FORM STAGE ── */}
        {stage === 'form' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#4ADE80', marginBottom: '8px' }}>◆ Tier 2 Application</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: '400', color: '#EEE8D8', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Tell us who you are.
              </h1>
              <p style={{ color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65' }}>
                This information is used only to verify your identity. Your ID is never displayed publicly — only your verified badge is.
              </p>
            </div>

            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                <div>
                  <label style={labelStyle}>I am joining as *</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    {['Founder', 'Investor', 'Co-Founder', 'Service Provider'].map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${role === r ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`, background: role === r ? 'rgba(74,222,128,0.1)' : 'transparent', color: role === r ? '#4ADE80' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{r}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Full legal name *</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="As it appears on your government ID" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>

                <div>
                  <label style={labelStyle}>LinkedIn profile URL *</label>
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                  <div style={{ fontSize: '11px', color: '#4A4838', marginTop: '5px', fontFamily: "'JetBrains Mono', monospace" }}>Must be a public profile with your real name and photo</div>
                </div>

                <div>
                  <label style={labelStyle}>Government ID type *</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    {["Passport", "Driver's License", "National ID"].map(t => (
                      <button key={t} type="button" onClick={() => setIdType(t)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${idType === t ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, background: idType === t ? 'rgba(201,168,76,0.1)' : 'transparent', color: idType === t ? '#C9A84C' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Upload ID photo *</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: idFile ? 'rgba(74,222,128,0.08)' : 'rgba(17,25,35,0.6)', border: `2px dashed ${idFile ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '18px', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '24px' }}>🪪</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: idFile ? '#4ADE80' : '#8E8B7A', marginBottom: '3px' }}>{idFile || 'Click to upload your ID'}</div>
                      <div style={{ fontSize: '11px', color: '#4A4838' }}>JPG or PNG · Max 10MB · Sent securely to Venia team only</div>
                    </div>
                    {idFile && <button type="button" onClick={e => { e.preventDefault(); setIdFile(null) }} style={{ background: 'none', border: 'none', color: '#8E8B7A', cursor: 'pointer', fontSize: '14px' }}>✕</button>}
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setIdFile(e.target.files[0].name) }} />
                  </label>
                </div>

                <div>
                  <label style={labelStyle}>Brief statement <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <textarea value={statement} onChange={e => setStatement(e.target.value)} placeholder="Tell us briefly what you do and why you are on Venia. This helps our review team." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' } as React.CSSProperties} onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.6', margin: 0 }}>
                Your ID is transmitted securely and reviewed only by the Venia team. It is never stored publicly, shared with other users, or used for any purpose other than confirming your identity. You will receive a response within 48 hours.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStage('info')} style={ghostBtn}>← Back</button>
              <button onClick={handleSubmit} disabled={!canSubmit || submitting}
                style={{ ...goldBtn, flex: 1, opacity: canSubmit && !submitting ? 1 : 0.4, cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed' }}>
                {submitting ? 'Submitting…' : 'Submit for Review →'}
              </button>
            </div>
          </>
        )}

        {/* ── PENDING STAGE ── */}
        {stage === 'pending' && (
          <div style={{ ...card, textAlign: 'center', padding: '56px 32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>✓</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: '400', color: '#EEE8D8', marginBottom: '10px' }}>
              Application submitted.
            </div>
            <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.75', maxWidth: '380px', margin: '0 auto 32px' }}>
              The Venia team will review your application within <strong style={{ color: '#C9A84C' }}>48 hours</strong>. Once approved, your profile and all listings will show the verified badge automatically.
            </p>

            {/* Status timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '320px', margin: '0 auto 36px', textAlign: 'left' }}>
              {[
                { label: 'Application received', done: true },
                { label: 'ID under review', done: false },
                { label: 'LinkedIn match confirmed', done: false },
                { label: 'Verified badge issued', done: false },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step.done ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)', border: `2px solid ${step.done ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: step.done ? '#4ADE80' : '#4A4838' }}>{step.done ? '✓' : ''}</div>
                    {i < arr.length - 1 && <div style={{ width: '2px', height: '24px', background: step.done ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)' }} />}
                  </div>
                  <div style={{ paddingTop: '2px', paddingBottom: i < arr.length - 1 ? '20px' : '0' }}>
                    <div style={{ fontSize: '13px', color: step.done ? '#EEE8D8' : '#4A4838', fontWeight: step.done ? '600' : '400' }}>{step.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
              <button onClick={() => router.push('/capital')} style={{ ...goldBtn }}>Back to Capital →</button>
              <button onClick={() => router.push('/welcome')} style={ghostBtn}>Go to Home</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
