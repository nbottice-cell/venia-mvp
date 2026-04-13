'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Stage = 'choose' | 'refine' | 'guided' | 'prompts' | 'brief'
type Framework = 'frustration' | 'skill' | 'community' | 'trend' | 'ambition'

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
    { q: "Is there something people clearly want and would pay for, but the cheap version is too limited and the good version is too expensive?", tag: "The Pricing Gap" },
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

const AI_REPLIES = [
  ["That is specific — and specific is exactly what we need. Most people describe this problem in generalities. You went straight to the friction point.", "That level of detail separates an idea from a product. You are not describing a category — you are describing a real moment."],
  ["That person sounds real. When you can describe one human this clearly, you have done more customer research than most founders who raise their first $50K.", "What you described is a story, not a demographic. Stories are what get people to open their wallets."],
  ["That is the insight. The ideal you described is not far away — it is just that no one has assembled the right pieces yet. That gap is your opportunity.", "Most people describe a feature when I ask this. You described a feeling. That is the right answer."],
  ["Good instinct. That shape has a clear monetization path and a direct line to the person you described.", "Noted. That form will inform whether Build or License Mode makes more sense."],
  ["That is the moat. What you just said is what will be on your Idea Brief under Unfair Advantage — the thing an investor will remember long after the meeting.", "Most people skip this question. You did not. That insight is what makes this defensible."],
]

export default function LaunchPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('choose')
  const [framework, setFramework] = useState<Framework | null>(null)
  const [rawIdea, setRawIdea] = useState('')
  const [reflection, setReflection] = useState<{hearing: string, unclear: string[], interesting: string} | null>(null)
  const [reflectionLoading, setReflectionLoading] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [answers, setAnswers] = useState<{tag: string, answer: string}[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [chat, setChat] = useState<{role: 'ai' | 'user', text: string}[]>([])
  const [aiTyping, setAiTyping] = useState(false)
  const [brief, setBrief] = useState<{names: string[], pitch: string, problem: string, solution: string, whyNow: string} | null>(null)
  const [ideaName, setIdeaName] = useState('')
  const [saving, setSaving] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat, aiTyping])

  const prompts = framework ? PROMPTS[framework] : []

  function analyzeIdea() {
    if (rawIdea.trim().length < 10) return
    setReflectionLoading(true)
    setTimeout(() => {
      const kw = rawIdea.toLowerCase()
      if (kw.includes('app') || kw.includes('platform') || kw.includes('tool')) {
        setReflection({ hearing: "You are building a software tool that solves a friction point in someone's workflow — saving time or reducing effort in a process that requires too many steps.", unclear: ["Whether the primary user is a consumer or a business — those are fundamentally different products.", "What the done state looks like for your user. When have they succeeded?"], interesting: "Software tools that solve workflow problems have the fastest path to first revenue on Venia." })
      } else if (kw.includes('food') || kw.includes('health') || kw.includes('wellness')) {
        setReflection({ hearing: "You are building something in the health or food space — a product that changes how people consume, track, or relate to something physical.", unclear: ["Whether this is a physical product, a subscription, or a digital companion.", "Who the early adopter is — health products succeed fastest when the first 100 users are already obsessed with the problem."], interesting: "Health and food products attract strong community support early — vocal advocates when they find something that works." })
      } else {
        setReflection({ hearing: "You are building something that connects people or removes a barrier between someone who has a need and the thing that would satisfy it.", unclear: ["What specifically makes your version different from what already exists.", "Whether the value is in the discovery, the transaction, or the relationship after."], interesting: "Ideas at the intersection of a real frustration and an undisrupted market validate fastest — the community responds to specificity." })
      }
      setReflectionLoading(false)
    }, 1800)
  }

  function startPrompts(fw?: Framework) {
    const f = fw || framework
    if (!f) return
    setFramework(f)
    setChat([{ role: 'ai', text: PROMPTS[f][0].q }])
    setPromptIndex(0)
    setAnswers([])
    setStage('prompts')
  }

  function sendAnswer() {
    if (!currentAnswer.trim() || aiTyping || !framework) return
    const answer = currentAnswer.trim()
    setCurrentAnswer('')
    const newChat = [...chat, { role: 'user' as const, text: answer }]
    setChat(newChat)
    const newAnswers = [...answers, { tag: prompts[promptIndex].tag, answer }]
    setAnswers(newAnswers)
    setAiTyping(true)
    const pool = AI_REPLIES[Math.min(promptIndex, AI_REPLIES.length - 1)]
    const reply = pool[Math.floor(Math.random() * pool.length)]
    setTimeout(() => {
      setAiTyping(false)
      const next = promptIndex + 1
      if (next >= prompts.length) {
        setChat(prev => [...prev, { role: 'ai', text: reply }])
        setTimeout(() => makeBrief(newAnswers), 500)
      } else {
        setChat(prev => [...prev, { role: 'ai', text: reply }, { role: 'ai', text: prompts[next].q }])
        setPromptIndex(next)
      }
    }, 1400 + Math.random() * 600)
  }

  function makeBrief(allAnswers: {tag: string, answer: string}[]) {
    const a1 = allAnswers[0]?.answer || 'a specific daily frustration'
    const a2 = allAnswers[1]?.answer || 'current solutions are fragmented'
    const a3 = allAnswers[2]?.answer || 'a seamless intuitive experience'
    const a5 = allAnswers[4]?.answer || 'lived experience from inside this community'
    const words = rawIdea.split(' ').filter(w => w.length > 4)
    const w = words[0] || 'Idea'
    setBrief({
      names: [`${w}OS`, `${w}Flow`, `Open${w}`].map(n => n.charAt(0).toUpperCase() + n.slice(1)),
      pitch: `A platform that solves ${a1.substring(0, 60)}… by removing the friction that makes this too hard for the people who need it most.`,
      problem: `${a2.substring(0, 120)}. People most affected have no good option — existing solutions are too expensive, too generic, or built without their real needs in mind.`,
      solution: `${a3.substring(0, 120)}. Built around the insight that ${a5.substring(0, 80)}.`,
      whyNow: 'The technology to deliver this properly now exists for the first time. The window to establish a first-mover position is open today.',
    })
    setStage('brief')
  }

  async function saveIdea(path: 'build' | 'license') {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/auth'); return }
      if (!brief) return
      const { error } = await supabase.from('ideas').insert({
        user_id: userData.user.id,
        name: ideaName || brief.names[0],
        pitch: brief.pitch,
        problem: brief.problem,
        solution: brief.solution,
        why_now: brief.whyNow,
        path,
        framework: framework || 'guided',
        raw_idea: rawIdea || null,
        answers,
        status: 'draft',
      })
      if (error) throw error
      router.push('/browse')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Error saving: ' + message)
    } finally {
      setSaving(false)
    }
  }

  const navStyle = { height: '52px', background: 'rgba(245,242,236,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', position: 'sticky' as const, top: 0, zIndex: 50 }
  const backBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#4A5A6C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const navTitle = { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1A2332', flex: 1 }
  const wrap = { maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }
  const card = { background: '#18222E', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', marginBottom: '16px' }
  const eyebrow = { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '8px' }
  const h1 = { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '600', color: '#EEE8D8', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '10px' }
  const sub = { color: '#8E8B7A', fontSize: '13px', lineHeight: '1.65', marginBottom: '24px' }
  const inputStyle = { width: '100%', padding: '12px 14px', background: 'rgba(17,25,35,0.8)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }
  const label = { display: 'block', marginBottom: '7px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.7)' }
  const goldBtn = { background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', color: '#111923', border: 'none', padding: '12px 24px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(201,168,76,0.25)' }
  const ghostBtn = { background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: '#8E8B7A', padding: '11px 22px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <nav style={navStyle}>
        <button onClick={() => stage === 'choose' ? router.push('/welcome') : setStage('choose')} style={backBtn}>← Back</button>
        <div style={navTitle}>Launch an Idea</div>
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
            <button onClick={analyzeIdea} disabled={rawIdea.length < 10 || reflectionLoading} style={{ ...goldBtn, width: '100%', opacity: rawIdea.length < 10 ? 0.5 : 1 }}>{reflectionLoading ? 'Analyzing…' : 'Analyze My Idea →'}</button>
          </div>

          {reflection && (
            <div style={card}>
              <div style={eyebrow}>✨ AI Reflection</div>
              {[
                { label: "What I am hearing", text: reflection.hearing, borderColor: 'rgba(201,168,76,0.18)', labelColor: '#C9A84C' },
                { label: "What is not clear yet", text: `• ${reflection.unclear[0]}\n• ${reflection.unclear[1]}`, borderColor: 'rgba(224,123,138,0.18)', labelColor: '#E07B8A' },
                { label: "What I find interesting", text: reflection.interesting, borderColor: 'rgba(74,222,128,0.18)', labelColor: '#4ADE80' },
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
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E2C06A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: '500', color: '#111923', flexShrink: 0 }}>{promptIndex + 1}</div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#8E8B7A', letterSpacing: '0.08em' }}>Question {promptIndex + 1} of {prompts.length}</div>
              <div style={{ fontSize: '12px', color: '#4A4838' }}>{FRAMEWORKS.find(f => f.id === framework)?.name} Path</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
              {prompts.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < promptIndex ? '#4ADE80' : i === promptIndex ? '#C9A84C' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(17px, 2.5vw, 21px)', fontWeight: '400', color: '#EEE8D8', lineHeight: '1.5', letterSpacing: '-0.01em' }}>{prompts[promptIndex]?.q}</p>
          </div>

          {chat.length > 1 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
              {chat.slice(1).map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: msg.role === 'ai' ? 'linear-gradient(135deg, #C9A84C, #2DD4BF)' : 'linear-gradient(135deg, #C9A84C, #E07B8A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#111923' }}>{msg.role === 'ai' ? 'V' : 'Me'}</div>
                  <div style={{ maxWidth: '82%', padding: '10px 13px', fontSize: '13px', lineHeight: '1.6', background: msg.role === 'ai' ? '#18222E' : 'rgba(201,168,76,0.12)', border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(201,168,76,0.2)', color: msg.role === 'ai' ? '#8E8B7A' : '#EEE8D8', borderRadius: msg.role === 'ai' ? '4px 10px 10px 10px' : '10px 4px 10px 10px' }}>{msg.text}</div>
                </div>
              ))}
              {aiTyping && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#111923', flexShrink: 0 }}>V</div>
                  <div style={{ padding: '12px 16px', borderRadius: '4px 10px 10px 10px', background: '#18222E', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4A4838', animation: `bounce 1.4s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer() } }} placeholder="Type your answer… (Enter to send)" disabled={aiTyping} rows={2} style={{ flex: 1, padding: '11px 13px', background: '#18222E', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', outline: 'none', color: '#EEE8D8', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", resize: 'none' } as React.CSSProperties} onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
            <button onClick={sendAnswer} disabled={!currentAnswer.trim() || aiTyping} style={{ width: '44px', height: '44px', borderRadius: '10px', background: !currentAnswer.trim() || aiTyping ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C, #E2C06A)', border: 'none', cursor: !currentAnswer.trim() || aiTyping ? 'not-allowed' : 'pointer', color: '#111923', fontSize: '16px', flexShrink: 0, alignSelf: 'flex-end' }}>→</button>
          </div>
          <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
        </div>
      )}

      {/* ── BRIEF ── */}
      {stage === 'brief' && brief && (
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={eyebrow}>✦ Your Idea Brief</div>
            <h1 style={{ ...h1, textAlign: 'center' }}>Your idea is <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>real</em> now.</h1>
            <p style={{ ...sub, textAlign: 'center' }}>Everything we built together, ready to launch or license today.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Choose a name</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {brief.names.map(name => (
                <button key={name} onClick={() => setIdeaName(name)} style={{ padding: '8px 16px', borderRadius: '8px', background: ideaName === name ? 'rgba(201,168,76,0.12)' : '#18222E', border: `1px solid ${ideaName === name ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`, color: ideaName === name ? '#C9A84C' : '#8E8B7A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{name}</button>
              ))}
            </div>
            <input type="text" value={ideaName} onChange={(e) => setIdeaName(e.target.value)} placeholder="Or type your own name…" style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.4)'} onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.15)'} />
          </div>

          <div style={{ background: '#18222E', border: '1px solid rgba(201,168,76,0.16)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(45,212,191,0.04))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '3px 10px', marginBottom: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C' }}>✨ AI Create Mode</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600', color: '#EEE8D8', marginBottom: '8px' }}>{ideaName || brief.names[0]}</div>
              <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.6' }}>{brief.pitch}</p>
            </div>
            <div style={{ padding: '24px' }}>
              {[{ label: 'The Problem', text: brief.problem }, { label: 'The Solution', text: brief.solution }, { label: 'Why Now', text: brief.whyNow }].map((s, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? '18px' : '0', paddingBottom: i < 2 ? '18px' : '0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#4A4838', marginBottom: '7px' }}>{s.label}</div>
                  <p style={{ fontSize: '13px', color: '#8E8B7A', lineHeight: '1.7' }}>{s.text}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '18px 24px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => saveIdea('build')} disabled={saving} style={{ ...goldBtn, padding: '13px', width: '100%' }}>{saving ? 'Saving…' : '⚡ Build Mode'}</button>
              <button onClick={() => saveIdea('license')} disabled={saving} style={{ background: 'linear-gradient(135deg, #2DD4BF, #1EBFAA)', color: '#111923', border: 'none', padding: '13px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{saving ? 'Saving…' : '🏛️ License Mode'}</button>
            </div>
            <div style={{ padding: '10px 24px 14px', textAlign: 'center', background: 'rgba(0,0,0,0.15)', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.08em', color: 'rgba(74,72,56,0.4)' }}>Saved as a draft — you choose when to publish</div>
          </div>
        </div>
      )}
    </div>
  )
}
