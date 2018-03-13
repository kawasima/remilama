const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 9000

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const config = require('./webpack.config.dev')
  const compiler = webpack(config)

  app.use(webpackHotMiddleware(compiler))
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }))
}


const ExpressPeerServer = require('peer').ExpressPeerServer;

const options = {
    debug: true
}

const server = require('http').createServer(app)
app.use('/peerjs', ExpressPeerServer(server, options))
app.use(express.static(path.join(__dirname, 'public')))
server.listen(port)
