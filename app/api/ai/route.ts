import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(systemPrompt: string, userMessage: string, maxTokens: number = 1024): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

function parseJSON(text: string): unknown {
  const clean = text.replace(/```json|```/g, '').trim()
  // Find the first { and last } to extract just the JSON
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  return JSON.parse(clean.slice(start, end + 1))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, payload } = body

    // ════════════════════════════════════════
    // ACTION: analyze_idea
    // Initial diagnostic — what is hearing, what is unclear, what is interesting
    // ════════════════════════════════════════
    if (action === 'analyze_idea') {
      const { rawIdea } = payload
      const system = `You are Venia AI — a sharp startup mentor reading a founder's raw idea. Give specific, honest feedback that responds to what they ACTUALLY wrote — not a generic template. If they named a specific problem, market, or type of person, reference it directly. Never be generic. Respond with ONLY a valid JSON object. No markdown backticks. No explanation.`

      const user = `Analyze this raw idea and respond with a JSON object with exactly these fields:
- "hearing": 2-3 sentences describing what you understand they want to build. Be specific to their words.
- "unclear": array of exactly 2 strings — the two most important ambiguities.
- "interesting": 1-2 sentences on the most commercially interesting aspect.

Raw idea: "${rawIdea}"

Respond with ONLY the JSON.`

      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    // ════════════════════════════════════════
    // ACTION: respond_to_answer
    // Conversational response during prompt journey
    // ════════════════════════════════════════
    if (action === 'respond_to_answer') {
      const { framework, promptTag, question, answer, conversationHistory, isLastQuestion } = payload

      const system = `You are Venia AI — a sharp startup mentor responding to a founder's answer during an ideation session.

Your job: read what they ACTUALLY wrote and respond with specific insight — not a generic affirmation.

Rules:
- NEVER open with "Great!", "Awesome!", "That's great" or any generic filler
- Reference the specific thing they said — their exact situation, person, or problem
- If vague, push toward specificity without asking a new question
- 2-3 sentences max — sharp, direct, warm
- No markdown, no lists, plain conversational text
- Do NOT ask a new question (next question handled separately)
- Framework: ${framework}${isLastQuestion ? '\n- This was the LAST question. End by telling them you now have everything and are generating their Idea Brief.' : ''}`

      const historyText = conversationHistory.map((m: {role: string, text: string}) =>
        `${m.role === 'ai' ? 'Venia AI' : 'Founder'}: ${m.text}`
      ).join('\n')

      const user = `Question tag: ${promptTag}
Question asked: "${question}"
Founder's answer: "${answer}"

Recent conversation:
${historyText.slice(-1200)}

Respond to their answer in 2-3 sentences.`

      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { reply: result.trim() } })
    }

    // ════════════════════════════════════════
    // ACTION: generate_brief
    // Synthesize all answers into structured Idea Brief
    // ════════════════════════════════════════
    if (action === 'generate_brief') {
      const { framework, rawIdea, answers } = payload

      const system = `You are Venia AI synthesizing a founder's session into an Idea Brief. Use their ACTUAL answers — the specific person, problem, and market they described. Product names must relate to what they described. Every section must feel specific to THIS founder. Respond with ONLY a valid JSON object. No markdown.`

      const answersText = answers.map((a: {tag: string, answer: string}) =>
        `${a.tag}: "${a.answer}"`
      ).join('\n')

      const user = `Generate a complete Idea Brief.

Framework: ${framework}
${rawIdea ? `Raw idea: "${rawIdea}"` : ''}
Answers:
${answersText}

Return JSON with: "names" (3 product names relevant to their idea), "pitch" (one sentence), "problem" (2-3 sentences), "solution" (2-3 sentences), "customer" (1-2 sentences), "whyNow" (1-2 sentences), "unfairAdvantage" (1-2 sentences).

ONLY the JSON object. No markdown.`

      const result = await callClaude(system, user, 2048)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    // ════════════════════════════════════════
    // ACTION: market_diagnostic
    // After brief is generated — provide market analysis
    // ════════════════════════════════════════
    if (action === 'market_diagnostic') {
      const { brief } = payload

      const system = `You are Venia AI providing a market diagnostic for a founder's idea. You are direct, specific, and honest. You do not flatter. You do not exaggerate. If a market is small or competitive, say so. If you are uncertain about a number, say so rather than fabricating. Use credible reasoning. Respond with ONLY a valid JSON object. No markdown.`

      const user = `Analyze this idea and provide a market diagnostic.

Idea: "${brief.pitch}"
Problem: "${brief.problem}"
Solution: "${brief.solution}"
Customer: "${brief.customer}"

Return a JSON object with these fields:
- "marketSize": 1-2 sentences with your honest estimate of the addressable market and the reasoning. Include a rough dollar figure if you can defend it. Say "I cannot estimate this accurately" if you cannot.
- "competitors": array of 3 objects, each with "name" (real or representative competitor name), "approach" (1 sentence on what they do), "gap" (1 sentence on what they miss that this idea could exploit).
- "regulatoryNotes": 1-2 sentences on regulatory or compliance considerations relevant to this idea. Say "no significant regulatory concerns" if true.
- "honestRisks": array of exactly 2 strings — the two biggest non-obvious risks the founder should know about.
- "fastestValidation": 1-2 sentences describing the cheapest, fastest way to validate the core assumption of this idea — something they could do this week.

Be specific and honest. ONLY JSON.`

      const result = await callClaude(system, user, 2048)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    // ════════════════════════════════════════
    // ACTION: revenue_paths
    // Three concrete 30-day money paths
    // ════════════════════════════════════════
    if (action === 'revenue_paths') {
      const { brief } = payload

      const system = `You are Venia AI helping a founder figure out how to make money from their idea in the next 30 days. You generate THREE concrete revenue paths — each one practical, each one different, each one executable by a founder with no team and no funding. Be specific, not generic. Respond with ONLY a valid JSON object.`

      const user = `Generate three 30-day revenue paths for this idea.

Idea: "${brief.pitch}"
Problem: "${brief.problem}"
Solution: "${brief.solution}"
Customer: "${brief.customer}"

Return a JSON array under the key "paths" with exactly 3 objects. Each object has:
- "name": short label for the path (e.g., "Pre-Order Validation", "Done-For-You Service", "Paid Waitlist")
- "description": 1-2 sentences on what this path is
- "weekOne": specific action to take this week
- "weekTwoToFour": what to do over the next 3 weeks
- "expectedRevenue": realistic dollar range they could hit in 30 days
- "risk": 1 sentence on the main downside or limitation

Be specific to THIS founder's idea — not generic startup advice. ONLY JSON with "paths" array.`

      const result = await callClaude(system, user, 2048)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    // ════════════════════════════════════════
    // ACTION: pitch_simulator
    // AI plays skeptical investor and asks tough questions
    // ════════════════════════════════════════
    if (action === 'pitch_simulator') {
      const { brief, founderResponse, conversationHistory, turnNumber } = payload

      const system = `You are playing the role of a sharp, skeptical seed investor — someone with real experience, no patience for vague answers, and a habit of asking questions that expose weak thinking.

You are evaluating this idea. You ask the kinds of questions a real investor would ask in a meeting — the ones that reveal whether the founder has actually thought through their business.

Style:
- Direct but not hostile — you want this founder to succeed
- Ask one focused question per response
- If their answer is strong, briefly acknowledge it before moving on
- If their answer is weak, point out specifically what is missing — kindly but honestly
- After 4-5 exchanges, deliver a final verdict (more on this below)
- Plain text only, conversational, 2-4 sentences max per turn

This is turn ${turnNumber} of approximately 5 turns.

${turnNumber >= 4 ? 'On this turn or the next, deliver a final verdict. Format the verdict like this:\n"Verdict: [one of: Strong Investment Candidate / Promising But Needs Work / Not Investable Yet]. [2-3 sentences explaining why, with specific feedback on what was strong and what was weak in this conversation.]"' : 'Continue with another sharp question.'}

Idea you are evaluating:
- Pitch: "${brief.pitch}"
- Problem: "${brief.problem}"
- Solution: "${brief.solution}"
- Customer: "${brief.customer}"
- Why Now: "${brief.whyNow}"`

      const historyText = conversationHistory.map((m: {role: string, text: string}) =>
        `${m.role === 'ai' ? 'Investor' : 'Founder'}: ${m.text}`
      ).join('\n\n')

      const user = `Conversation so far:
${historyText}

${founderResponse ? `Founder just said: "${founderResponse}"` : 'Begin the pitch session — ask your first sharp question.'}

Your response now:`

      const result = await callClaude(system, user)
      return NextResponse.json({ success: true, data: { reply: result.trim() } })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI route error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
