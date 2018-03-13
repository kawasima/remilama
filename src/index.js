import React from 'react'
import { AppContainer } from 'react-hot-loader'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import App from './components/App'

const root = document.querySelector('#root')

if (process.env.NODE_ENV === 'production') {
  ReactDOM.render(<Provider store={store}><App/></Provider>, root)
} else {
  const render = async () => {
    const { default: App } = (await import('./components/App'))
    ReactDOM.render(
      <AppContainer>
        <Provider store={store}>
          <App/>
        </Provider>
      </AppContainer>,
      root
    )
  }
  render()
  if (module.hot) module.hot.accept('./components/App', render)
}

/*
const Peer = require('peerjs')

const peer = new Peer({
  host: 'localhost',
  port: 9000,
  path: '/peerjs',
  // Set highest debug level (log everything!).
  debug: 3,
  // Set a logging function:
  logFunction: function() {
    var copy = Array.prototype.slice.call(arguments).join(' ');
    console.log(copy)
  }
});

const conn = peer.connect('')
conn.on('open', () => conn.send('hi!'))
*/
