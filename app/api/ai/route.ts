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

    // ── ACTION: analyze_idea ──
    // Takes a raw idea dump and returns structured reflection
    if (action === 'analyze_idea') {
      const { rawIdea } = payload

      const system = `You are Venia AI — a sharp startup mentor reading a founder's raw idea. Your job is to give them specific, honest feedback that responds to what they ACTUALLY wrote — not a generic template. If they named a specific problem, market, or type of person, reference it directly. Never be generic. Respond with ONLY a valid JSON object. No markdown backticks. No explanation outside the JSON.`

      const user = `Analyze this raw idea and respond with a JSON object with exactly these three fields:
- "hearing": 2-3 sentences describing what you understand they are trying to build. Be specific to what they wrote, not generic.
- "unclear": an array of exactly 2 strings — the two most important things that are still ambiguous or undefined about this idea.
- "interesting": 1-2 sentences about the most commercially interesting or defensible aspect of what they described.

Raw idea:
"${rawIdea}"

Respond with ONLY the JSON object. No markdown backticks. No explanation.`

      const result = await callClaude(system, user)
      const clean = result.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json({ success: true, data: parsed })
    }

    // ── ACTION: respond_to_answer ──
    // Takes the conversation so far and responds to the user's latest answer
    if (action === 'respond_to_answer') {
      const { framework, promptTag, question, answer, conversationHistory, isLastQuestion } = payload

      const system = `You are Venia AI — a sharp startup mentor responding to a founder's answer during an ideation session.

Your job: read what they ACTUALLY wrote and respond with specific insight — not a generic affirmation.

Rules:
- NEVER open with "Great!", "Awesome!", "That's great", or any generic filler
- Reference the specific thing they said — their exact situation, person, or problem
- If vague, push toward specificity without asking a new question
- 2-3 sentences max — sharp, direct, warm
- No markdown, no lists, plain conversational text
- Do NOT ask a new question (next question handled separately)
- Framework: \${framework}`

      const historyText = conversationHistory
        .map((m: {role: string, text: string}) => `${m.role === 'ai' ? 'Venia AI' : 'Founder'}: ${m.text}`)
        .join('\n')

      const user = `Framework: ${framework}
Current question tag: ${promptTag}
Question asked: "${question}"
Founder's answer: "${answer}"

Conversation so far:
${historyText}

Respond to their answer now.`

      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { reply: result.trim() } })
    }

    // ── ACTION: generate_brief ──
    // Takes all answers and generates a complete Idea Brief
    if (action === 'generate_brief') {
      const { framework, rawIdea, answers } = payload

      const system = `You are Venia AI synthesizing a founder's ideation session into an Idea Brief. Use their ACTUAL answers — the specific person they described, the exact problem they named, the market they identified. Product names should relate to what they actually described. Every section must feel specific to THIS founder, not a generic template. The pitch must sound like a real person said it. Respond with ONLY a valid JSON object. No markdown backticks. No preamble.`

      const answersText = answers
        .map((a: {tag: string, answer: string}) => `${a.tag}: "${a.answer}"`)
        .join('\n')

      const user = `Based on this founder's ideation session, generate a complete Idea Brief.

Framework used: ${framework}
${rawIdea ? `Raw idea they started with: "${rawIdea}"` : ''}

Their answers to guided questions:
${answersText}

Generate a JSON object with exactly these fields:
- "names": array of exactly 3 suggested product/company names (short, memorable, relevant to what they described)
- "pitch": one sentence (max 25 words) that captures the core value proposition
- "problem": 2-3 sentences describing the specific problem. Use details from their answers.
- "solution": 2-3 sentences describing the solution. Be specific, not generic.
- "customer": 1-2 sentences describing the specific customer. Reference the person they described if they did.
- "whyNow": 1-2 sentences explaining why this is the right moment to build this.
- "unfairAdvantage": 1-2 sentences about the founder's specific edge based on what they shared.

Be specific to what they actually said. Do not be generic.
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
