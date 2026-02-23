import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { ExpressPeerServer } from 'peer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    {
      name: 'peerjs-server',
      configureServer(server) {
        const app = express()

        // Capture upgrade listeners BEFORE PeerJS adds its own
        const existingUpgradeListeners = server.httpServer.listeners('upgrade').slice()

        const peerServer = ExpressPeerServer(server.httpServer, { debug: true })
        app.use('/peerjs', peerServer)
        server.middlewares.use(app)

        // PeerJS's ws.Server({ server }) attaches an "upgrade" listener that
        // intercepts ALL WebSocket upgrade requests and rejects non-matching
        // paths with 400.  This breaks Vite's HMR WebSocket.
        // Fix: find the listener PeerJS added, remove it, and re-add it with
        // a path guard so only /peerjs/peerjs upgrades go to PeerJS.
        const allUpgradeListeners = server.httpServer.listeners('upgrade').slice()
        const peerWsPath = '/peerjs/peerjs'
        for (const listener of allUpgradeListeners) {
          if (!existingUpgradeListeners.includes(listener)) {
            // This is the listener PeerJS added
            server.httpServer.removeListener('upgrade', listener)
            server.httpServer.on('upgrade', (req, socket, head) => {
              if (req.url && req.url.startsWith(peerWsPath)) {
                listener(req, socket, head)
              }
            })
          }
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
})
