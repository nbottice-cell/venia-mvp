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
      const system = `You are Venia AI — a sharp startup mentor reading a founder's raw idea. Give specific, honest feedback that responds to what they ACTUALLY wrote. If they named a specific problem, market, or type of person, reference it directly. Respond with ONLY a valid JSON object. No markdown backticks.`
      const user = `Analyze this raw idea and respond with a JSON object with exactly these three fields:
- "hearing": 2-3 sentences describing what you understand they are trying to build. Be specific to what they wrote.
- "unclear": an array of exactly 2 strings — the two most important things still ambiguous.
- "interesting": 1-2 sentences about the most commercially interesting aspect.

Raw idea: "${rawIdea}"

Respond with ONLY the JSON object. No markdown.`
      const result = await callClaude(system, user)
      const clean = result.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ success: true, data: parsed })
    }

    if (action === 'respond_to_answer') {
      const { framework, promptTag, question, answer, conversationHistory, isLastQuestion } = payload
      const system = `You are Venia AI — a sharp startup mentor. Read what the founder ACTUALLY wrote and respond with specific insight. NEVER open with "Great!" or generic affirmations. Reference their specific words. 2-3 sentences max. Plain text only. Do NOT ask a new question.${isLastQuestion ? ' This was the last question — tell them you are now generating their Idea Brief.' : ''}`
      const historyText = conversationHistory.map((m: {role: string, text: string}) => `${m.role === 'ai' ? 'Venia AI' : 'Founder'}: ${m.text}`).join('\n')
      const user = `Framework: ${framework}
Question tag: ${promptTag}
Question asked: "${question}"
Founder's answer: "${answer}"

Recent conversation:
${historyText.slice(-800)}

Respond to their answer in 2-3 sentences.`
      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { reply: result.trim() } })
    }

    if (action === 'generate_brief') {
      const { framework, rawIdea, answers } = payload
      const system = `You are Venia AI synthesizing a founder's session into an Idea Brief. Use their ACTUAL answers — the specific person, problem, and market they described. Product names must relate to what they described. Every section must feel specific to THIS founder. Respond with ONLY a valid JSON object. No markdown.`
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

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI route error:', message)
    // Return the actual error message so we can see what's wrong
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
