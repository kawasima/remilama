/**
 * AI engine — sends PDF page text to an LLM and returns structured review comments.
 *
 * Supports two providers:
 *   - "anthropic" (default): Anthropic Claude API (ANTHROPIC_API_KEY)
 *   - "openai":  OpenAI-compatible API such as LM Studio (OPENAI_BASE_URL + OPENAI_API_KEY)
 */

import Anthropic from '@anthropic-ai/sdk'

const VALID_CATEGORIES = [
  'bug', 'missing', 'inconsistency', 'unclear', 'risk', 'maintainability', 'question',
]

const SYSTEM_PROMPT = `You are an expert document reviewer. You review documents for quality issues.
When you find an issue, respond with a JSON array of review comments.

Each comment must have:
- "description": A concise description of the issue (in Japanese if the document is in Japanese, otherwise English)
- "category": One of: ${VALID_CATEGORIES.join(', ')}

Valid categories:
- bug: Factual errors, incorrect information
- missing: Missing information that should be present
- inconsistency: Contradictions within the document
- unclear: Ambiguous or hard to understand content
- risk: Potential risks or concerns
- maintainability: Readability, structure, or maintenance concerns
- question: Questions or proposals about the content

If there are no issues, return an empty array [].
Respond ONLY with the JSON array, no other text.`

async function callAnthropic({ filename, page, text, model }) {
  const client = new Anthropic()
  const response = await client.messages.create({
    model: model || 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: `Review the following content from page ${page} of "${filename}":\n\n${text}` },
    ],
  })
  return response.content[0]?.text || '[]'
}

async function callOpenAI({ filename, page, text, model }) {
  const baseUrl = (process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1').replace(/\/+$/, '')
  const apiKey = process.env.OPENAI_API_KEY || 'lm-studio'

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || '',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Review the following content from page ${page} of "${filename}":\n\n${text}` },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '[]'
}

/**
 * Review the text of a single PDF page.
 *
 * @param {Object} opts
 * @param {string} opts.filename - The document filename
 * @param {number} opts.page     - Page number (1-based)
 * @param {string} opts.text     - Extracted text for this page
 * @param {string} [opts.model]  - Model name/ID
 * @param {string} [opts.provider] - "anthropic" or "openai"
 * @returns {Promise<Array<{ page: number, x: number, y: number, description: string, category: string, filename: string }>>}
 */
export async function reviewPage({ filename, page, text, model, provider }) {
  if (!text.trim()) return []

  const call = provider === 'openai' ? callOpenAI : callAnthropic
  const raw = await call({ filename, page, text, model })

  // Extract the JSON array from the response, handling common LLM quirks:
  // - <think>...</think> reasoning tags (e.g. DeepSeek, QwQ)
  // - Markdown code fences (```json ... ```)
  // - Leading/trailing prose
  let content = raw
  // Remove everything up to and including </think> if present
  const thinkEnd = content.lastIndexOf('</think>')
  if (thinkEnd !== -1) {
    content = content.slice(thinkEnd + '</think>'.length)
  }
  // Strip markdown code fences
  content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
  // As a last resort, extract the first JSON array from the text
  if (!content.startsWith('[')) {
    const match = content.match(/\[[\s\S]*\]/)
    if (match) content = match[0]
  }

  try {
    const comments = JSON.parse(content)
    if (!Array.isArray(comments)) {
      console.error('[ai-engine] AI response is not an array:', content)
      return []
    }

    return comments
      .filter((c) => c.description && VALID_CATEGORIES.includes(c.category))
      .map((c) => ({
        page,
        x: 0.05,
        y: 0.1 + Math.random() * 0.8,
        description: c.description,
        category: c.category,
        filename,
      }))
  } catch {
    console.error('[ai-engine] Failed to parse AI response:', raw)
    return []
  }
}
