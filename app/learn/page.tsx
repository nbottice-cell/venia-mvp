'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const sections = [
  {
    id: 'what',
    icon: '✦',
    color: '#C9A84C',
    title: 'What is Venia?',
    content: `Venia is an entrepreneurship operating system — the first platform that takes you from having an idea (or not even having one yet) all the way to making real money from it.

Most platforms assume you already have a business plan, a team, and a network. Venia starts earlier than that. It starts at the moment of curiosity — before the idea is fully formed — and walks you through every step until money is in your account.

The name comes from Latin: it means permission, grace, and indulgence. It also carries the meaning of "profound humility and an act of penance" — a reminder that this platform exists to correct a system that has historically made entrepreneurship inaccessible to most people.`,
  },
  {
    id: 'who',
    icon: '⬡',
    color: '#2DD4BF',
    title: 'Who is Venia for?',
    content: `Venia serves three kinds of people simultaneously.

The Aspiring Founder — someone who has an idea, a skill, or creative potential, but lacks the network, capital, or infrastructure to act on it. They may be working a 9-to-5, barely getting by, and carrying an idea they don't know how to start. Everything on this platform is built for them first.

The Everyday Investor — someone with $50–$500 who is tired of the stock market being the only accessible wealth-building tool. They want to put money into ideas they actually understand and believe in. Venia gives them early access to companies before they become household names.

The Inventor — someone who has good ideas but doesn't want to run a company. Through Licensing Mode, they can post their concept and let corporations find them. No pitching, no meetings — just an idea and a deal.`,
  },
  {
    id: 'how',
    icon: '◈',
    color: '#E2C06A',
    title: 'How does it work?',
    content: `The core loop on Venia is simple: you post an idea, people believe in it, money moves.

Step 1 — Create your idea. Use AI Create Mode to find or refine your concept, or submit one you already have.

Step 2 — Choose your path. Build Mode means you want to raise funding and run the company yourself. License Mode means you want a corporation to find your idea and pay you for it.

Step 3 — Go live. Your idea gets a public page with a funding goal, a support button, and a community that can back it instantly.

Step 4 — Get paid. Pre-orders, community support pledges, or a corporate licensing offer — the money routes directly to you.

Everything else — the network, the builder marketplace, the corporate discovery dashboard — is infrastructure that makes each of those four steps faster and more likely to succeed.`,
  },
  {
    id: 'paths',
    icon: '⚡',
    color: '#C9A84C',
    title: 'The Two Paths',
    content: `Every idea on Venia follows one of two paths — and you can switch between them at any time.

Build Mode is for founders who want to run their company. You set a funding goal, choose a campaign duration, and the community can back your idea with pre-orders or support pledges. When you hit your goal, you build. This is the Kickstarter model, but with AI guidance, a network of builders to hire, and an investor feed watching for traction.

License Mode is for inventors who want to be paid for their creativity without running a company. Your idea is published to a corporate discovery feed where verified companies actively search for licensable concepts. When a company finds something they want, they initiate a licensing inquiry through Venia. You negotiate, you decide, and Venia facilitates the transaction. You retain full ownership unless you explicitly accept a deal.

Neither path is permanent. A founder can flip to License Mode if corporate interest materializes. An inventor can switch to Build Mode if no offers come in. The choice is always yours.`,
  },
  {
    id: 'reliability',
    icon: '🛡',
    color: '#2DD4BF',
    title: 'The Reliability Score',
    content: `Every idea and every founder on Venia has a Reliability Score — a five-layer trust signal that tells investors and corporations how serious and prepared you are.

Layer 1 is Identity Verification — confirming you are a real person with a verifiable history. Layer 2 is Idea Completeness — an AI-generated score based on how clearly you've defined the problem, the customer, and the revenue model. Layer 3 is Community Validation — the quality of engagement your idea generates from real users. Layer 4 is Traction Indicators — whether you respond to questions, post updates, and show signs of a serious founder. Layer 5 is Venia Verified — an optional human review that unlocks the top tier of visibility.

The score is displayed as a trust tier, not a punitive number. It always points forward. Every layer shows you specifically what would improve it. The goal is to build trust between founders and their community — not to gatekeep.`,
  },
  {
    id: 'start',
    icon: '→',
    color: '#E2C06A',
    title: 'How do I get started?',
    content: `The fastest path to your first dollar on Venia is three steps.

First, submit your idea. If you already have one, go to Launch an Idea and describe it in plain language. If you don't have one yet, use AI Create Mode — choose a creative framework, answer five guided questions, and come out the other side with a structured concept ready to post.

Second, choose Build or License. Build if you want to run it. License if you want someone to pay you for it.

Third, go live and share it. Post your listing on Reddit, in startup communities, to your personal network, and anywhere else your target audience might be. The Venia community is growing — but your own network is your first audience.

There is no minimum. There is no application process. There are no gatekeepers. If you have something worth building, Venia is where you start today.`,
  },
]

export default function LearnPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('what')

  const current = sections.find(s => s.id === activeSection)!

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F2EC',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* Top nav */}
      <nav style={{
        height: '52px', background: 'rgba(245,242,236,0.97)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(201,168,76,0.18)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '14px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => router.push('/welcome')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4A5A6C', fontSize: '12px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2332')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#4A5A6C')}
        >
          ← Back
        </button>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '16px', fontWeight: '600', color: '#1A2332',
          flex: 1,
        }}>
          Learn About Venia
        </div>
        <button
          onClick={() => router.push('/launch')}
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #E2C06A)',
            color: '#111923', border: 'none',
            padding: '7px 16px', borderRadius: '8px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(201,168,76,0.25)',
          }}
        >
          Launch an Idea →
        </button>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', gap: '28px' }}>

        {/* Sidebar nav */}
        <aside style={{
          width: '220px', flexShrink: 0,
          position: 'sticky', top: '76px',
          alignSelf: 'flex-start',
        }}>
          <div style={{
            background: '#18222E',
            border: '1px solid rgba(201,168,76,0.14)',
            borderRadius: '14px', padding: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          }}>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px', borderRadius: '8px',
                  border: 'none', cursor: 'pointer',
                  background: activeSection === s.id ? `rgba(201,168,76,0.12)` : 'transparent',
                  color: activeSection === s.id ? s.color : '#8E8B7A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '12px', fontWeight: activeSection === s.id ? '600' : '500',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '9px',
                  marginBottom: '1px',
                  borderLeft: activeSection === s.id ? `2px solid ${s.color}` : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== s.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== s.id) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', opacity: 0.8 }}>
                  {s.icon}
                </span>
                {s.title}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{
            marginTop: '16px', padding: '14px 16px',
            background: '#18222E', border: '1px solid rgba(201,168,76,0.14)',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.5)', marginBottom: '8px',
            }}>
              Your Progress
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`,
                background: 'linear-gradient(90deg, #C9A84C, #2DD4BF)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#8E8B7A' }}>
              {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length} sections
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Section header */}
          <div style={{
            background: '#18222E',
            border: '1px solid rgba(201,168,76,0.16)',
            borderRadius: '16px', padding: '28px 32px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(201,168,76,0.06)',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: current.color, marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '7px',
            }}>
              <span>{current.icon}</span>
              Venia Guide
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(24px, 3vw, 34px)',
              fontWeight: '600', color: '#EEE8D8',
              letterSpacing: '-0.02em', lineHeight: '1.2',
            }}>
              {current.title}
            </h1>
          </div>

          {/* Content */}
          <div style={{
            background: '#18222E',
            border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            marginBottom: '16px',
          }}>
            {current.content.split('\n\n').map((para, i) => (
              <p key={i} style={{
                fontSize: '14px', color: i === 0 ? '#EEE8D8' : '#8E8B7A',
                lineHeight: '1.8',
                marginBottom: i < current.content.split('\n\n').length - 1 ? '20px' : '0',
                fontWeight: i === 0 ? '400' : '400',
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            {sections.findIndex(s => s.id === activeSection) > 0 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection)
                  setActiveSection(sections[idx - 1].id)
                }}
                style={{
                  background: '#18222E',
                  border: '1px solid rgba(201,168,76,0.15)',
                  color: '#8E8B7A', padding: '11px 22px',
                  borderRadius: '9px', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '13px', fontWeight: '500',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                ← Previous
              </button>
            )}
            <div style={{ flex: 1 }} />
            {sections.findIndex(s => s.id === activeSection) < sections.length - 1 ? (
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection)
                  setActiveSection(sections[idx + 1].id)
                }}
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E2C06A)',
                  color: '#111923', border: 'none',
                  padding: '11px 24px', borderRadius: '9px',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '13px', fontWeight: '700',
                  transition: 'all 0.15s',
                  boxShadow: '0 4px 14px rgba(201,168,76,0.25)',
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => router.push('/launch')}
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E2C06A)',
                  color: '#111923', border: 'none',
                  padding: '11px 24px', borderRadius: '9px',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '13px', fontWeight: '700',
                  transition: 'all 0.15s',
                  boxShadow: '0 4px 14px rgba(201,168,76,0.25)',
                }}
              >
                Ready — Launch My Idea →
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
