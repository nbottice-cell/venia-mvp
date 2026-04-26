import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5'

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  if (apiKey === 'paste_your_new_key_here') throw new Error('ANTHROPIC_API_KEY is still placeholder')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API returned ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'analyze_idea') {
      const { rawIdea } = payload
      const system = `You are Venia — a warm, encouraging guide helping someone develop their first real idea. Your tone is like a great teacher: patient, specific, and genuinely excited about what they shared. They are not an entrepreneur yet — they are someone with a spark. Your job is to reflect their idea back clearly and make them feel understood. Respond with ONLY a valid JSON object. No markdown backticks.`
      const user = `Analyze this raw idea and respond with a JSON object with exactly these three fields:
- "hearing": 2-3 sentences reflecting back what you understand they want to build. Be warm and specific to what they wrote. Make them feel heard.
- "unclear": an array of exactly 2 strings — frame these as gentle next questions to explore together, not gaps or problems. Start each with "We'll want to figure out..."
- "interesting": 1-2 sentences about the most exciting or promising aspect of what they shared. Be genuinely enthusiastic.

Raw idea: "${rawIdea}"

Respond with ONLY the JSON object. No markdown.`
      const result = await callClaude(system, user)
      const clean = result.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ success: true, data: parsed })
    }

    if (action === 'respond_to_answer') {
      const { framework, promptTag, question, answer, conversationHistory, isLastQuestion } = payload
      const system = `You are Venia — a warm, patient guide helping a first-time founder develop their idea. Your users are NOT startup experts. They are curious people with a spark who need a teacher, not an investor. Follow these rules strictly:

1. NEVER respond with just a question. Always give them something first: a reflection, a reframe, or a concrete scaffold.
2. If their answer is short, vague, or underdeveloped — do NOT just ask "why?" or another open-ended question. Instead: acknowledge what they said, then give them a fill-in-the-blank sentence or 2-3 specific options to choose from to help them go deeper. Example format: "To take that further, try finishing this sentence: 'The person I am building this for is someone who ___ every day.' For example, it could be a nurse who..., or a college student who..., or a parent who..."
3. Never make them feel wrong or underprepared. Frame vague answers as a starting point, not a failure.
4. Be warm, specific, and encouraging. Reference what they actually wrote.
5. Keep it to 3-4 sentences max. Plain text only. No bullet points.
${isLastQuestion ? '6. This was the final question. End by telling them warmly that you now have everything you need and are generating their Idea Brief.' : ''}`
      const historyText = conversationHistory.map((m: {role: string, text: string}) => `${m.role === 'ai' ? 'Venia' : 'Founder'}: ${m.text}`).join('\n')
      const user = `Framework: ${framework}
Question tag: ${promptTag}
Question asked: "${question}"
Founder's answer: "${answer}"

Recent conversation:
${historyText.slice(-800)}

Respond to their answer. If it is vague or short, give them a concrete scaffold or fill-in-the-blank to help them go deeper — do not just ask an open question.`
      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { reply: result.trim() } })
    }

    if (action === 'generate_brief') {
      const { framework, rawIdea, answers } = payload
      const system = `You are Venia synthesizing a founder's session into their first real Idea Brief. Use their ACTUAL answers — the specific person, problem, and market they described. Write every section as if you are a wise mentor putting their scattered thoughts into clear, confident language for them. Make them feel like their idea is real and worth pursuing. Product names must relate to what they described. Respond with ONLY a valid JSON object. No markdown.`
      const answersText = answers.map((a: {tag: string, answer: string}) => `${a.tag}: "${a.answer}"`).join('\n')
      const user = `Generate a complete Idea Brief.

Framework: ${framework}
${rawIdea ? `Raw idea: "${rawIdea}"` : ''}
Answers:
${answersText}

Return JSON with these fields: "names" (array of 3 product names), "pitch" (one sentence), "problem" (2-3 sentences), "solution" (2-3 sentences), "customer" (1-2 sentences), "whyNow" (1-2 sentences), "unfairAdvantage" (1-2 sentences).

ONLY the JSON object. No markdown.`
      const result = await callClaude(system, user)
      const clean = result.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ success: true, data: parsed })
    }

    if (action === 'generate_connect_message') {
      const { targetName, targetTagline, targetCategory, ideaName, ideaPitch } = payload
      const system = `You are Venia — helping a founder write a warm, specific outreach message to a potential collaborator or partner. The message should feel human and direct, not like a template. It should be 3–5 sentences: introduce the founder briefly, reference something specific about the recipient's background, explain what they are working on (if an idea is provided), and make a clear, respectful ask. Do not use hollow phrases like "I came across your profile" or "I hope this message finds you well." Plain text only.`
      const ideaContext = ideaName ? `The founder is working on: "${ideaName}" — ${ideaPitch}` : 'The founder has not yet specified a particular idea.'
      const user = `Write a connection request message from a founder to ${targetName} (${targetTagline}), who is listed as a ${targetCategory} on Venia.

${ideaContext}

Write the message in first person from the founder's perspective. 3–5 sentences. Warm, specific, and human. No subject line. Plain text only.`
      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { message: result.trim() } })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI route error:', message)
    // Return the actual error message so we can see what's wrong
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
