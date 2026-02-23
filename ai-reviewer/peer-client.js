/**
 * PeerJS client for Node.js — connects to a remilama Reviewee as a Reviewer.
 *
 * Polyfills WebRTC globals using @roamhq/wrtc so PeerJS can run outside
 * the browser, then manages the connection lifecycle and message protocol.
 */

import wrtc from '@roamhq/wrtc'
import { WebSocket } from 'ws'
import { v4 as uuidv4 } from 'uuid'

// Polyfill browser globals that PeerJS expects
Object.assign(globalThis, {
  RTCPeerConnection: wrtc.RTCPeerConnection,
  RTCSessionDescription: wrtc.RTCSessionDescription,
  RTCIceCandidate: wrtc.RTCIceCandidate,
  MediaStream: wrtc.MediaStream,
})
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket
}
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { platform: 'node' }
}

// Dynamic import — must come AFTER globals are set.
// peerjs is a CJS module; when dynamically imported from ESM,
// all named exports live under .default
const { Peer } = (await import('peerjs')).default

/**
 * Connect to a remilama review session as a Reviewer.
 *
 * @param {Object} opts
 * @param {string} opts.serverUrl - e.g. "http://localhost:3000"
 * @param {string} opts.reviewId  - The review ID to join
 * @param {string} opts.name      - Display name for this reviewer
 * @param {function} opts.onReviewInfo - Called with review info when received
 * @param {function} opts.onFile       - Called with { name, data: ArrayBuffer } when file is received
 * @returns {{ conn, peer, reviewerId, postComment, disconnect }}
 */
export function connectAsReviewer({ serverUrl, reviewId, name, onReviewInfo, onFile }) {
  return new Promise((resolve, reject) => {
    const url = new URL(serverUrl)
    const host = url.hostname
    const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80)
    const secure = url.protocol === 'https:'
    const reviewerId = uuidv4()

    const peer = new Peer({
      host,
      port,
      path: '/peerjs',
      secure,
      debug: 1,
    })

    const fileChunks = {}

    peer.on('error', (err) => {
      console.error('[peer-client] Peer error:', err.type, err.message)
      reject(err)
    })

    peer.on('open', () => {
      console.log('[peer-client] Connected to signaling server, joining review:', reviewId)

      const conn = peer.connect(reviewId, { serialization: 'json' })

      conn.on('open', () => {
        console.log('[peer-client] Data connection opened')

        function postComment({ page, x, y, description, category, filename }) {
          conn.send({
            type: 'REVIEW/ADD_COMMENT',
            id: uuidv4(),
            postedAt: Date.now(),
            postedBy: { id: reviewerId, name },
            x,
            y,
            page,
            filename,
            description,
            category: category || '',
          })
        }

        function updateStatus(action) {
          conn.send({
            type: 'UPDATE_REVIEWER',
            reviewer: { id: reviewerId, action },
          })
        }

        function disconnect() {
          conn.close()
          peer.destroy()
        }

        resolve({ conn, peer, reviewerId, postComment, updateStatus, disconnect })
      })

      conn.on('data', (message) => {
        if (message.type !== 'FILE_CHUNK') {
          console.log('[peer-client] Received message:', message.type)
        }
        switch (message.type) {
          case 'REVIEW_INFO':
            // Identify ourselves
            conn.send({
              type: 'REVIEWER',
              reviewer: { id: reviewerId, name },
            })
            onReviewInfo?.(message.review)
            // Request the first file
            if (message.review.files?.length > 0) {
              console.log('[peer-client] Requesting file:', message.review.files[0].name)
              conn.send({ type: 'FILE_REQUEST', filename: message.review.files[0].name })
            } else {
              console.log('[peer-client] No files in review')
            }
            break

          case 'FILE_CHUNK': {
            const key = message.name
            if (!fileChunks[key]) {
              fileChunks[key] = { chunks: new Array(message.total), received: 0 }
              console.log(`[peer-client] Receiving file: ${key} (${message.total} chunks)`)
            }
            const buf = fileChunks[key]
            buf.chunks[message.index] = message.chunk
            buf.received++
            if (buf.received % 50 === 0) {
              console.log(`[peer-client] ${key}: ${buf.received}/${message.total} chunks`)
            }
            if (buf.received === message.total) {
              console.log(`[peer-client] File complete: ${key}`)
              const base64 = buf.chunks.join('')
              delete fileChunks[key]
              // Decode Base64 to ArrayBuffer
              const binary = Buffer.from(base64, 'base64')
              const arrayBuffer = binary.buffer.slice(
                binary.byteOffset,
                binary.byteOffset + binary.byteLength
              )
              onFile?.({ name: key, data: arrayBuffer })
            }
            break
          }

          case 'REVIEW/UPDATE_COMMENTS':
            break

          case 'NAVIGATE':
            break

          default:
            console.log('[peer-client] Unknown message type:', message.type)
            break
        }
      })

      conn.on('close', () => {
        console.log('[peer-client] Connection closed')
      })

      conn.on('error', (err) => {
        console.error('[peer-client] Connection error:', err)
      })
    })
  })
}
