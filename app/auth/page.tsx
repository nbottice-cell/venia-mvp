'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/welcome')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111923 0%, #18222E 50%, #1E2B3A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
        animation: 'fadeUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '52px', fontWeight: '600',
            background: 'linear-gradient(135deg, #C9A84C, #E2C06A, #C9A84C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1, marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            Venia
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.6)',
          }}>
            Entrepreneurship OS
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(24, 34, 46, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 4px 16px rgba(201,168,76,0.08)',
        }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: '4px',
            background: '#111923', borderRadius: '10px',
            padding: '4px', marginBottom: '28px',
            border: '1px solid rgba(201,168,76,0.1)',
          }}>
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '9px',
                  borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '13px', fontWeight: '600',
                  transition: 'all 0.2s',
                  background: mode === m ? 'linear-gradient(135deg, #C9A84C, #E2C06A)' : 'transparent',
                  color: mode === m ? '#111923' : 'rgba(238,232,216,0.5)',
                  boxShadow: mode === m ? '0 2px 8px rgba(201,168,76,0.25)' : 'none',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name field - signup only */}
            {mode === 'signup' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', marginBottom: '7px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'rgba(201,168,76,0.7)',
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  required={mode === 'signup'}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(17,25,35,0.8)',
                    border: '1px solid rgba(201,168,76,0.15)',
                    borderRadius: '10px', outline: 'none',
                    color: '#EEE8D8', fontSize: '13px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', marginBottom: '7px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.7)',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(17,25,35,0.8)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderRadius: '10px', outline: 'none',
                  color: '#EEE8D8', fontSize: '13px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', marginBottom: '7px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.7)',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                required
                minLength={mode === 'signup' ? 8 : undefined}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(17,25,35,0.8)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderRadius: '10px', outline: 'none',
                  color: '#EEE8D8', fontSize: '13px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
              />
            </div>

            {/* Error / Success messages */}
            {error && (
              <div style={{
                marginBottom: '16px', padding: '11px 14px',
                background: 'rgba(224,123,138,0.1)',
                border: '1px solid rgba(224,123,138,0.25)',
                borderRadius: '8px', color: '#E07B8A',
                fontSize: '12px', lineHeight: '1.5',
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                marginBottom: '16px', padding: '11px 14px',
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: '8px', color: '#4ADE80',
                fontSize: '12px', lineHeight: '1.5',
              }}>
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C, #E2C06A)',
                color: '#111923', border: 'none',
                borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '13px', fontWeight: '700',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(201,168,76,0.25)',
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(201,168,76,0.35)'
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(201,168,76,0.25)'
              }}
            >
              {loading
                ? 'Please wait…'
                : mode === 'signin'
                ? 'Sign In to Venia →'
                : 'Create My Account →'}
            </button>
          </form>

          {/* Footer note */}
          <div style={{
            marginTop: '20px', textAlign: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(74,72,56,0.6)',
          }}>
            Free to join · No card required
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          textAlign: 'center', marginTop: '24px',
          fontFamily: "'Playfair Display', serif",
          fontSize: '14px', fontStyle: 'italic',
          color: 'rgba(201,168,76,0.4)',
        }}>
          Where ideas find their believers.
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(74,72,56,0.5); }
      `}</style>
    </div>
  )
}
