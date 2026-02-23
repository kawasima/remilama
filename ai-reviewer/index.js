#!/usr/bin/env node
/**
 * remilama AI Reviewer — connects to a running review session via PeerJS
 * and posts AI-generated review comments on each page of the PDF.
 *
 * Usage:
 *   # Anthropic Claude (default)
 *   ANTHROPIC_API_KEY=sk-xxx node index.js --server http://localhost:3000 --review-id <id>
 *
 *   # LM Studio / OpenAI-compatible
 *   node index.js --server http://localhost:3000 --review-id <id> --provider openai
 *   OPENAI_BASE_URL=http://localhost:1234/v1 node index.js --server ... --provider openai --model <model-name>
 */

import { parseArgs } from 'node:util'
import { connectAsReviewer } from './peer-client.js'
import { extractText } from './pdf-reader.js'
import { reviewPage } from './ai-engine.js'

const { values: args } = parseArgs({
  options: {
    server: { type: 'string', short: 's' },
    'review-id': { type: 'string', short: 'r' },
    name: { type: 'string', short: 'n', default: 'AI Reviewer' },
    model: { type: 'string', short: 'm' },
    provider: { type: 'string', short: 'p', default: 'anthropic' },
  },
})

const serverUrl = args.server
const reviewId = args['review-id']
const reviewerName = args.name
const model = args.model
const provider = args.provider

if (!serverUrl || !reviewId) {
  console.error('Usage: node index.js --server <url> --review-id <id> [--name <name>] [--model <model>] [--provider anthropic|openai]')
  process.exit(1)
}

if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required for anthropic provider')
  process.exit(1)
}

console.log(`[ai-reviewer] Connecting to ${serverUrl}, review: ${reviewId}, name: ${reviewerName}, provider: ${provider}`)

let reviewInfo = null

const { postComment, updateStatus, disconnect } = await connectAsReviewer({
  serverUrl,
  reviewId,
  name: reviewerName,
  onReviewInfo: (info) => {
    reviewInfo = info
    console.log(`[ai-reviewer] Review: ${info.name}, files: ${info.files?.map((f) => f.name).join(', ')}`)
  },
  onFile: async ({ name, data }) => {
    console.log(`[ai-reviewer] Received file: ${name} (${(data.byteLength / 1024).toFixed(1)} KB)`)

    try {
      const { numPages, pages } = await extractText(data)
      console.log(`[ai-reviewer] Extracted text from ${numPages} pages`)

      for (const { page, text } of pages) {
        if (!text.trim()) {
          console.log(`[ai-reviewer] Page ${page}: no text, skipping`)
          continue
        }

        console.log(`[ai-reviewer] Reviewing page ${page}...`)
        updateStatus(`Reviewing page ${page} of ${name}`)
        const comments = await reviewPage({ filename: name, page, text, model, provider })

        for (const comment of comments) {
          console.log(`[ai-reviewer]   → [${comment.category}] ${comment.description.slice(0, 80)}`)
          postComment(comment)
        }

        if (comments.length === 0) {
          console.log(`[ai-reviewer]   → No issues found`)
        }
      }

      updateStatus(`Review complete for ${name}`)
      console.log(`[ai-reviewer] Review complete for ${name}`)
    } catch (err) {
      console.error(`[ai-reviewer] Error processing ${name}:`, err)
    }
  },
})

// Keep the process alive until Ctrl+C
process.on('SIGINT', () => {
  console.log('\n[ai-reviewer] Disconnecting...')
  disconnect()
  process.exit(0)
})

console.log('[ai-reviewer] Waiting for files... (Ctrl+C to exit)')
