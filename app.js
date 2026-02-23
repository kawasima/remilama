import express from 'express'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { ExpressPeerServer } from 'peer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 9000

const server = http.createServer(app)
app.use('/peerjs', ExpressPeerServer(server, { debug: true }))
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

server.listen(port, function() {
  console.log('Start server: port=' + port)
})
