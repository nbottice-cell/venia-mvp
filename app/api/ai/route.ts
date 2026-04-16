import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

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
    throw new Error(`Claude API error: ${err}`)
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
      const system = `You are Venia AI — a sharp, direct, and genuinely helpful creative partner for aspiring entrepreneurs. Analyze someone's raw idea and give honest, specific feedback. Respond with ONLY a valid JSON object, no markdown, no explanation outside the JSON.`
      const user = `Analyze this raw idea and respond with a JSON object with exactly these three fields:
- "hearing": 2-3 sentences describing what you understand they are trying to build. Be specific to what they wrote.
- "unclear": an array of exactly 2 strings — the two most important things still ambiguous about this idea.
- "interesting": 1-2 sentences about the most commercially interesting aspect of what they described.

Raw idea: "${rawIdea}"

Respond with ONLY the JSON object. No markdown backticks.`
      const result = await callClaude(system, user)
      const clean = result.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ success: true, data: parsed })
    }

    if (action === 'respond_to_answer') {
      const { framework, promptTag, question, answer, conversationHistory, isLastQuestion } = payload
      const system = `You are Venia AI — a creative co-pilot helping someone discover their startup idea using the "${framework}" framework. Respond to the founder's answer in 2-3 sentences max. Be warm but direct. Never say "Great!" or "Awesome!" as an opener. Do NOT ask another question.${isLastQuestion ? ' This was the last question — end with a brief note that you are now building their Idea Brief.' : ''} Plain text only, no markdown.`
      const historyText = conversationHistory.map((m: {role: string, text: string}) => `${m.role === 'ai' ? 'Venia AI' : 'Founder'}: ${m.text}`).join('\n')
      const user = `Question tag: ${promptTag}\nQuestion: "${question}"\nFounder's answer: "${answer}"\n\nConversation so far:\n${historyText}\n\nRespond to their answer now.`
      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { reply: result.trim() } })
    }

    if (action === 'generate_brief') {
      const { framework, rawIdea, answers } = payload
      const system = `You are Venia AI — an expert at turning founder conversations into compelling idea briefs. Write in plain language. Be specific, not generic. Use the actual details the founder provided. Respond with ONLY a valid JSON object. No markdown.`
      const answersText = answers.map((a: {tag: string, answer: string}) => `${a.tag}: "${a.answer}"`).join('\n')
      const user = `Generate a complete Idea Brief based on this founder's session.

Framework: ${framework}
${rawIdea ? `Raw idea: "${rawIdea}"` : ''}
Answers:
${answersText}

Return a JSON object with exactly these fields:
- "names": array of 3 short memorable product names relevant to what they described
- "pitch": one sentence max 25 words capturing the core value proposition
- "problem": 2-3 sentences describing the specific problem using their details
- "solution": 2-3 sentences describing the solution, specific not generic
- "customer": 1-2 sentences describing the specific customer they described
- "whyNow": 1-2 sentences on why this is the right moment
- "unfairAdvantage": 1-2 sentences on the founder's specific edge from what they shared

Respond with ONLY the JSON object. No markdown backticks.`
      const result = await callClaude(system, user)
      const clean = result.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ success: true, data: parsed })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI route error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
