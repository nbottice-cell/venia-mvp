import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5'

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

    // ════════════════════════════════════════
    // ACTION: journal_to_brief
    // Turn a single journal entry into a full Idea Brief
    // ════════════════════════════════════════
    if (action === 'journal_to_brief') {
      const { content } = payload as { content: string }

      const system = `You are Venia AI reading one journal entry from a founder and extracting the most commercially promising thread from it. The entry may be casual, exploratory, or stream-of-consciousness — your job is to find the strongest business idea signal and build it into a complete, specific Idea Brief. Never be generic. Be specific to what they actually wrote. Respond with ONLY a valid JSON object. No markdown.`

      const user = `Journal entry:
"${content.slice(0, 3000)}"

Generate a complete Idea Brief grounded in this entry. Return JSON with: "names" (3 product name ideas relevant to what they wrote), "pitch" (one sentence), "problem" (2-3 sentences), "solution" (2-3 sentences), "customer" (1-2 sentences), "whyNow" (1-2 sentences), "unfairAdvantage" (1-2 sentences).

ONLY the JSON object.`

      const result = await callClaude(system, user, 2048)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    // ════════════════════════════════════════
    // ACTION: synthesize_journal
    // Read all journal entries and surface 2-3 business ideas from patterns
    // ════════════════════════════════════════
    if (action === 'synthesize_journal') {
      const { entries } = payload as { entries: { date: string; content: string }[] }

      const system = `You are Venia AI reading a founder's private journal entries and identifying business idea patterns. Look for recurring themes, frustrations, observations, or skills mentioned across entries. Every idea you suggest must be grounded in something the founder actually wrote — never invent ideas that have no basis in their notes. Be specific, not generic. Respond with ONLY a valid JSON object. No markdown.`

      const entriesText = entries.map((e, i) =>
        `Entry ${i + 1} (${e.date}):\n"${e.content}"`
      ).join('\n\n')

      const user = `Here are ${entries.length} journal entries from a founder:\n\n${entriesText}\n\nIdentify 2-3 business ideas that are genuinely suggested by patterns across these entries.\n\nReturn JSON: { "ideas": [ { "title": "short name for the idea", "description": "2-3 sentences on what this business could be and why it fits them", "connection": "quote or close paraphrase from their notes that sparked this idea" } ] }\n\nONLY the JSON object.`

      const result = await callClaude(system, user, 1500)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    // ════════════════════════════════════════
    // ACTION: quick_build
    // Branching Q&A — one focused question + 3-4 choices per turn
    // After 7 answers, generates a full Idea Brief
    // ════════════════════════════════════════
    if (action === 'quick_build') {
      const { history, questionNumber } = payload as {
        history: { question: string; answer: string }[]
        questionNumber: number
      }

      const system = `You are Venia AI running a Quick Build session. You discover a business idea by asking one sharp, focused question at a time — each with 3-4 concrete, distinct answer choices the founder can tap. Branch intelligently based on previous answers, digging deeper into what was revealed. If an answer looks like free-text (not one of the preset choices), treat it as a candid personal response and use it to shape subsequent questions even more precisely.

ALWAYS respond with ONLY valid JSON. No markdown. No explanation outside the JSON.

If questionNumber < 7: respond with:
{ "type": "question", "tag": "short 2-3 word label", "question": "one focused question (not too long)", "choices": ["specific choice A", "specific choice B", "specific choice C", "specific choice D"] }

If questionNumber >= 7: respond with 3-4 meaningfully distinct idea directions derived from the same answers. Each idea should take a different product angle (e.g. mobile app vs SaaS platform vs marketplace vs community tool). Respond with:
{ "type": "briefs", "ideas": [ { "names": ["Product Name", "Alt Name"], "pitch": "one compelling sentence", "problem": "3-4 sentences describing the pain point vividly — who feels it, when, why existing tools fail", "solution": "3-4 sentences on what the product actually does, how it works, what makes it different — be specific about features and UX", "customer": "2-3 sentences painting a clear portrait of the target user: their role, habits, frustrations, readiness to pay", "whyNow": "2-3 sentences on market timing — what tech, behavior, or culture shift makes this the right moment", "unfairAdvantage": "2-3 sentences on what this specific founder knows or has that a generic team could not replicate" }, ... 3 more ideas ] }

Question guidelines:
- Q1: What is driving this idea? (broad starting angle)
- Q2-Q4: Narrow into domain, customer, and core problem based on prior answers
- Q5: Ask about the product or platform form — give 3-4 concrete, specific options such as: "A mobile app that lets users do X", "A SaaS dashboard that helps teams track Y", "A marketplace connecting A with B", "A community platform where Z can share and get Z". Make the choices feel like real product ideas, not abstract categories.
- Q6: Uncover the monetization angle and business model
- Q7: Final clarifying question that reveals founder's edge or commitment
- Q8+: Generate the brief — use all answers to make every field specific to THIS founder's exact idea. Reference the product form, customer, and domain explicitly. The brief should feel like a real product spec, not a template.

Make each question feel like a sharp mentor finding the idea, not a form to fill out.`

      const historyText = history.length === 0
        ? 'No previous answers yet.'
        : history.map((h, i) => `Q${i + 1}: ${h.question}\nAnswer: ${h.answer}`).join('\n\n')

      const user = `Quick Build session — questionNumber: ${questionNumber}\n\nPrevious Q&A:\n${historyText}\n\n${questionNumber >= 7 ? 'Generate 3-4 distinct idea briefs based on all answers above. Each should take a different product form (mobile app, SaaS, marketplace, community platform, etc). Make each feel like a real, specific product — not a template.' : 'Ask the next question with 3-4 tappable choices.'}\n\nRespond with ONLY the JSON.`

      const result = await callClaude(system, user, questionNumber >= 7 ? 5000 : 512)
      return NextResponse.json({ success: true, data: parseJSON(result) })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI route error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
