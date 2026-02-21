/*eslint-env node*/
const express = require('express')
const path = require('path')
const peer = require('./server')
const app = express()
const port = process.env.PORT || 9000

const options = {
    debug: true
}

const server = require('http').createServer(app)
app.use('/peerjs', peer.ExpressPeerServer(server, options))
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

server.listen(port, function() {
  console.log('Start server: port=' + port)
})
