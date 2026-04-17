'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Stage = 'choose' | 'refine' | 'guided' | 'prompts' | 'brief'
type Framework = 'frustration' | 'skill' | 'community' | 'trend' | 'ambition'
type SavePath = 'further' | 'build' | 'license' | 'later'

const FRAMEWORKS = [
  { id: 'frustration', icon: '😤', name: 'Frustration', desc: 'Something in your life is broken and you keep hitting the same wall.' },
  { id: 'skill',       icon: '💪', name: 'Skill',       desc: "You're better at something than most people and haven't monetized it yet." },
  { id: 'community',   icon: '🤝', name: 'Community',   desc: 'You belong to a group that is consistently underserved.' },
  { id: 'trend',       icon: '📈', name: 'Trend',       desc: "You've noticed something changing and want to build on that shift." },
  { id: 'ambition',    icon: '🚀', name: 'Ambition',    desc: "You just want to build something that matters." },
]

const PROMPTS: Record<string, {q: string, tag: string}[]> = {
  frustration: [
    { q: "What is something you complained about more than once in the last 30 days? Not a world problem — something small that annoyed you personally.", tag: "The Frustration" },
    { q: "Describe the last time a product or service completely failed you. Walk through exactly what happened.", tag: "Broken Experience" },
    { q: "Picture one specific person whose life would be better if your solution existed. What does their day look like?", tag: "The One Person" },
    { q: "What task related to this problem takes far longer than it should?", tag: "The Time Sink" },
    { q: "What do you know about this problem from your own life that someone building from the outside would miss?", tag: "Unfair Advantage" },
  ],
  skill: [
    { q: "What is something you know how to do that takes most people significantly longer to learn?", tag: "The Expertise" },
    { q: "What topic do you find yourself explaining to people repeatedly because you know more than those around you?", tag: "The Dinner Table" },
    { q: "Is there something people clearly want and would pay for, but the cheap version is too limited and the good version costs too much?", tag: "The Pricing Gap" },
    { q: "What is something people quietly need but feel awkward admitting in public?", tag: "The Private Need" },
    { q: "What do you have — connections, knowledge, lived experience — that most people in your space would not have?", tag: "Unfair Advantage" },
  ],
  community: [
    { q: "What community or niche group do you belong to that mainstream products consistently get wrong?", tag: "The Community" },
    { q: "Who is consistently overlooked by the current market? What do they need that nobody is building?", tag: "The Underserved" },
    { q: "Picture one specific person in this community. What does their day look like?", tag: "The One Person" },
    { q: "What transaction in this community currently requires a middleman that technology could make direct?", tag: "The Middleman" },
    { q: "What do you know about this community from the inside that an outsider would miss?", tag: "Unfair Advantage" },
  ],
  trend: [
    { q: "What behavior have you noticed more people doing in the last two years that did not exist before? What product does that create demand for?", tag: "The Trend" },
    { q: "Pick an industry that feels old and resistant to change. What is the one thing it has refused to modernize?", tag: "The Blind Spot" },
    { q: "Name one industry you know well and one you find fascinating. What does a business at their intersection look like?", tag: "The Combination" },
    { q: "Imagine it is 10 years from now and a company you wish you had built is worth a billion dollars. What did it do?", tag: "Future Backward" },
    { q: "What do you know about this trend from your own observation that most builders in this space are missing?", tag: "Unfair Advantage" },
  ],
  ambition: [
    { q: "If you had no fear of failure — what would you build? What is actually stopping you from starting today?", tag: "The Permission" },
    { q: "Imagine it is 10 years from now and a company you wish you had built is worth a billion dollars. What did it do?", tag: "Future Backward" },
    { q: "Picture the one person this would help the most. Not a demographic — one human. Describe their day.", tag: "The One Person" },
    { q: "What business model from one industry has never been applied to a different industry where it would clearly work?", tag: "The Remix" },
    { q: "What is the one thing you know — from your life or expertise — that gives you an unfair advantage here?", tag: "Unfair Advantage" },
  ],
}

async function aiAnalyzeIdea(rawIdea: string) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'analyze_idea', payload: { rawIdea } }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.data as { hearing: string, unclear: string[], interesting: string }
}

async function aiGenerateBrief(framework: string, rawIdea: string, answers: {tag: string, answer: string}[]) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate_brief', payload: { framework, rawIdea, answers } }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.data as { names: string[], pitch: string, problem: string, solution: string, customer: string, whyNow: string, unfairAdvantage: string }
}

export default function LaunchPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('choose')
  const [framework, setFramework] = useState<Framework | null>(null)
  const [rawIdea, setRawIdea] = useState('')
  const [reflection, setReflection] = useState<{hearing: string, unclear: string[], interesting: string} | null>(null)
  const [reflectionLoading, setReflectionLoading] = useState(false)
  const [reflectionError, setReflectionError] = useState('')
  const [promptIndex, setPromptIndex] = useState(0)
  const [answers, setAnswers] = useState<{tag: string, answer: string}[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [briefLoading, setBriefLoading] = useState(false)
  const [brief, setBrief] = useState<{names: string[], pitch: string, problem: string, solution: string, customer: string, whyNow: string, unfairAdvantage: string} | null>(null)
  const [ideaName, setIdeaName] = useState('')
  const [saving, setSaving] = useState(false)

  const prompts = framework ? PROMPTS[framework] : []
  const isLastQuestion = promptIndex + 1 >= prompts.length

  async function analyzeIdea() {
    if (rawIdea.trim().length < 10) return
    setReflectionLoading(true)
    setReflectionError('')
    try {
      const result = await aiAnalyzeIdea(rawIdea)
      setReflection(result)
    } catch {
      setReflectionError('Something went wrong analyzing your idea. Please try again.')
    } finally {
      setReflectionLoading(false)
    }
  }

  function startPrompts(fw?: Framework) {
    const f = fw || framework
    if (!f) return
    setFramework(f)
    setPromptIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setStage('prompts')
  }

  async function sendAnswer() {
    if (!currentAnswer.trim() || !framework) return
    const answer = currentAnswer.trim()
    setCurrentAnswer('')

    const newAnswers = [...answers, { tag: prompts[promptIndex].tag, answer }]
    setAnswers(newAnswers)

    if (isLastQuestion) {
      setStage('brief')
      setBriefLoading(true)
      try {
        const briefData = await aiGenerateBrief(framework, rawIdea, newAnswers)
        setBrief(briefData)
      } catch {
        setBrief({
          names: ['YourIdea', 'IdeaFlow', 'LaunchIt'],
          pitch: 'A solution built around the problem you described.',
          problem: 'The problem you described affects many people who currently have no good option.',
          solution: 'Your solution addresses this directly using your unique insight.',
          customer: 'The specific person you described throughout this session.',
          whyNow: 'The conditions to build this successfully exist today.',
          unfairAdvantage: 'Your lived experience gives you insight no outsider could replicate.',
        })
      } finally {
        setBriefLoading(false)
      }
    } else {
      setPromptIndex(promptIndex + 1)
    }
  }

  async function saveIdea(path: SavePath) {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      if (!brief) return
      const { data: inserted, error } = await supabase.from('ideas').insert({
        user_id: userData.user.id,
        name: ideaName || brief.names[0],
        pitch: brief.pitch,
        problem: brief.problem,
        solution: brief.solution,
        why_now: brief.whyNow,
        path: path === 'further' || path === 'later' ? 'build' : path,
        framework: framework || 'guided',
        raw_idea: rawIdea || null,
        answers,
        status: 'draft',
      }).select('id').single()
      if (error) throw new Error((error as {message?: string}).message || JSON.stringify(error))
      if (path === 'later') {
        router.push('/ideas')
      } else {
        router.push(`/ideas/${inserted.id}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as {message?: string})?.message || 'Save failed'
      alert('Error saving: ' + message)
    } finally {
      setSaving(false)
    }
  }

  // ── STYLES ──
  const navStyle: React.CSSProperties = { height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky', top: 0, zIndex: 50 }
  const wrap = { maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }
  const card = { background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', marginBottom: '16px' }
  const eyebrow: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '8px' }
  const h1: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '600', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '10px' }
  const sub: React.CSSProperties = { color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', marginBottom: '24px' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const label: React.CSSProperties = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }
  const goldBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 24px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(201,168,76,0.25)' }
  const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '11px 22px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={navStyle}>
        <button onClick={() => stage === 'choose' ? router.push('/welcome') : setStage('choose')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }}>Launch an Idea</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {(['choose','refine','guided','prompts','brief'] as Stage[]).map(s => (
            <div key={s} style={{ width: stage === s ? '18px' : '6px', height: '6px', borderRadius: '3px', background: stage === s ? '#C9A84C' : 'rgba(201,168,76,0.2)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </nav>

      {/* ── CHOOSE ── */}
      {stage === 'choose' && (
        <div style={wrap}>
          <div style={card}>
            <div style={eyebrow}>✦ Create Mode</div>
            <h1 style={h1}>Where does your <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>idea live right now?</em></h1>
            <p style={sub}>Choose the path that fits where you are today. Both lead to the same place — a real idea ready to launch.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'refine', icon: '💡', title: 'I Have an Idea', desc: 'You know what you want to build. Let AI help you sharpen it until it is launch-ready.', color: '#C9A84C', tag: 'Refine' },
                { id: 'guided', icon: '🌱', title: 'I Have a Feeling', desc: 'You know what frustrates you or excites you. Guided questions will uncover what is hiding there.', color: '#2DD4BF', tag: 'Guided' },
              ].map(door => (
                <button key={door.id} onClick={() => setStage(door.id as Stage)}
                  style={{ background: 'rgba(17,25,35,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(0)' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{door.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#EEE8D8', marginBottom: '4px' }}>{door.title}</div>
                    <div style={{ fontSize: '12px', color: '#8E8B7A', lineHeight: '1.5' }}>{door.desc}</div>
                  </div>
                  <div style={{ background: door.color === '#C9A84C' ? 'rgba(201,168,76,0.12)' : 'rgba(45,212,191,0.12)', border: `1px solid ${door.color === '#C9A84C' ? 'rgba(201,168,76,0.25)' : 'rgba(45,212,191,0.25)'}`, color: door.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', flexShrink: 0 }}>{door.tag}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REFINE ── */}
      {stage === 'refine' && (
        <div style={wrap}>
          <div style={card}>
            <div style={eyebrow}>✦ Path 1 — Refine Your Idea</div>
            <h1 style={h1}>Tell me your idea.</h1>
            <p style={sub}>Write like you are explaining it to a friend at dinner. The messier the better.</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Your idea</label>
              <textarea value={rawIdea} onChange={(e) => setRawIdea(e.target.value)} placeholder="I have been thinking about building something that helps people who… The problem I keep seeing is…" style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', lineHeight: '1.65' } as React.CSSProperties} onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
            </div>
            <button onClick={analyzeIdea} disabled={rawIdea.length < 10 || reflectionLoading} style={{ ...goldBtn, width: '100%', opacity: rawIdea.length < 10 ? 0.5 : 1 }}>
              {reflectionLoading ? '✦ Analyzing your idea…' : 'Analyze My Idea →'}
            </button>
            {reflectionError && <div style={{ marginTop: '10px', color: '#E07B8A', fontSize: '12px', textAlign: 'center' }}>{reflectionError}</div>}
          </div>

          {reflection && (
            <div style={card}>
              <div style={eyebrow}>✨ AI Reflection</div>
              {[
                { label: "What I am hearing", text: reflection.hearing, borderColor: 'rgba(201,168,76,0.18)', labelColor: '#C9A84C' },
                { label: "What we will explore together", text: `• ${reflection.unclear[0]}\n• ${reflection.unclear[1]}`, borderColor: 'rgba(224,123,138,0.18)', labelColor: '#E07B8A' },
                { label: "What I find exciting", text: reflection.interesting, borderColor: 'rgba(74,222,128,0.18)', labelColor: '#4ADE80' },
              ].map((block, i) => (
                <div key={i} style={{ background: 'rgba(17,25,35,0.6)', border: `1px solid ${block.borderColor}`, borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: block.labelColor, marginBottom: '7px' }}>{block.label}</div>
                  <p style={{ color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', whiteSpace: 'pre-line' }}>{block.text}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setReflection(null)} style={{ ...ghostBtn, flex: 1 }}>← Refine further</button>
                <button onClick={() => startPrompts('frustration')} style={{ ...goldBtn, flex: 2 }}>This feels right → Continue</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GUIDED FRAMEWORKS ── */}
      {stage === 'guided' && (
        <div style={wrap}>
          <div style={card}>
            <div style={eyebrow}>✦ Path 2 — Guided Prompts</div>
            <h1 style={h1}>What is your starting point?</h1>
            <p style={sub}>Pick the one that feels most true to where you are right now.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {FRAMEWORKS.map(fw => (
                <button key={fw.id} onClick={() => setFramework(fw.id as Framework)}
                  style={{ background: framework === fw.id ? 'rgba(201,168,76,0.10)' : 'rgba(17,25,35,0.6)', border: `1px solid ${framework === fw.id ? 'rgba(201,168,76,0.30)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{fw.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: framework === fw.id ? '#EEE8D8' : '#8E8B7A', marginBottom: '3px' }}>{fw.name}</div>
                    <div style={{ fontSize: '12px', color: '#4A4838', lineHeight: '1.5' }}>{fw.desc}</div>
                  </div>
                  {framework === fw.id && <div style={{ marginLeft: 'auto', color: '#C9A84C', fontSize: '16px' }}>✓</div>}
                </button>
              ))}
            </div>
            <button onClick={() => startPrompts()} disabled={!framework} style={{ ...goldBtn, width: '100%', opacity: framework ? 1 : 0.4 }}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── PROMPTS ── */}
      {stage === 'prompts' && (
        <div style={wrap}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: '600', color: '#111923', flexShrink: 0 }}>{promptIndex + 1}</div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#8E8B7A', letterSpacing: '0.08em' }}>Question {promptIndex + 1} of {prompts.length}</div>
              <div style={{ fontSize: '12px', color: '#4A4838' }}>{FRAMEWORKS.find(f => f.id === framework)?.name} Path</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
              {prompts.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < promptIndex ? '#4ADE80' : i === promptIndex ? '#C9A84C' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              ))}
            </div>
          </div>

          {/* Question */}
          <div style={card}>
            <div style={eyebrow}>{prompts[promptIndex]?.tag}</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 2.8vw, 24px)', fontWeight: '400', color: '#EEE8D8', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
              {prompts[promptIndex]?.q}
            </p>
          </div>

          {/* Answer */}
          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
            <label style={label}>Your answer</label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer() } }}
              placeholder="Write whatever comes to mind — there are no wrong answers here."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
              autoFocus
            />
            <button
              onClick={sendAnswer}
              disabled={!currentAnswer.trim()}
              style={{ ...goldBtn, width: '100%', marginTop: '12px', opacity: currentAnswer.trim() ? 1 : 0.4 }}
            >
              {isLastQuestion ? 'Build My Brief →' : 'Next Question →'}
            </button>
          </div>
        </div>
      )}

      {/* ── BRIEF ── */}
      {stage === 'brief' && (
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={eyebrow}>✦ Your Idea Brief</div>
            <h1 style={{ ...h1, textAlign: 'center' }}>
              {briefLoading ? 'Building your brief…' : <>Your idea is <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>real</em> now.</>}
            </h1>
            <p style={{ ...sub, textAlign: 'center' }}>
              {briefLoading ? 'Venia AI is synthesizing everything you shared.' : 'Choose what happens next.'}
            </p>
          </div>

          {briefLoading && (
            <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C9A84C', animation: `bounce 1.4s ${i * 0.2}s infinite` }} />)}
              </div>
              <div style={{ color: '#8E8B7A', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>Generating your Idea Brief…</div>
              <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }`}</style>
            </div>
          )}

          {brief && !briefLoading && (
            <>
              {/* Name picker */}
              <div style={{ marginBottom: '16px' }}>
                <label style={label}>Choose a name</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {brief.names.map(name => (
                    <button key={name} onClick={() => setIdeaName(name)} style={{ padding: '8px 16px', borderRadius: '8px', background: ideaName === name ? 'rgba(201,168,76,0.12)' : '#18222E', border: `1px solid ${ideaName === name ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, color: ideaName === name ? '#C9A84C' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{name}</button>
                  ))}
                </div>
                <input type="text" value={ideaName} onChange={(e) => setIdeaName(e.target.value)} placeholder="Or type your own name…" style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
              </div>

              {/* Brief content */}
              <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.16)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginBottom: '16px' }}>
                <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(45,212,191,0.04))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600', color: '#EEE8D8', marginBottom: '8px' }}>{ideaName || brief.names[0]}</div>
                  <p style={{ fontSize: '14px', color: '#C8C4B4', lineHeight: '1.6', fontStyle: 'italic' }}>{brief.pitch}</p>
                </div>
                <div style={{ padding: '24px' }}>
                  {[
                    { label: 'The Problem', text: brief.problem },
                    { label: 'The Solution', text: brief.solution },
                    { label: 'Who It Is For', text: brief.customer },
                    { label: 'Why Now', text: brief.whyNow },
                    { label: 'Your Unfair Advantage', text: brief.unfairAdvantage },
                  ].map((s, i, arr) => (
                    <div key={i} style={{ marginBottom: i < arr.length - 1 ? '18px' : '0', paddingBottom: i < arr.length - 1 ? '18px' : '0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '7px', opacity: 0.7 }}>{s.label}</div>
                      <p style={{ fontSize: '13px', color: '#C8C4B4', lineHeight: '1.75' }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 action buttons */}
              <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '16px' }}>What would you like to do?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => saveIdea('further')} disabled={saving}
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '14px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: saving ? 0.7 : 1 }}>
                    <div>
                      <div>Build Further</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Open your brief and keep developing it</div>
                    </div>
                    <span>→</span>
                  </button>
                  <button onClick={() => saveIdea('build')} disabled={saving}
                    style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '14px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: saving ? 0.7 : 1 }}>
                    <div>
                      <div>⚡ Build It</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Start building this idea yourself</div>
                    </div>
                    <span>→</span>
                  </button>
                  <button onClick={() => saveIdea('license')} disabled={saving}
                    style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)', color: '#2DD4BF', padding: '14px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: saving ? 0.7 : 1 }}>
                    <div>
                      <div>🏛️ License It</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Sell or license this idea to someone else</div>
                    </div>
                    <span>→</span>
                  </button>
                  <button onClick={() => saveIdea('later')} disabled={saving}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#4A4838', padding: '14px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: saving ? 0.7 : 1 }}>
                    <div>
                      <div>Save for Later</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Keep it in My Ideas and decide another time</div>
                    </div>
                    <span>→</span>
                  </button>
                </div>
                {saving && <div style={{ textAlign: 'center', marginTop: '14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#C9A84C', letterSpacing: '0.1em' }}>Saving…</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
