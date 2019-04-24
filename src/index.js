import React from 'react'
import { AppContainer } from 'react-hot-loader'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import store, { persistor, runSaga } from './store'
import rootSaga from './sagas'
import App from './components/App'

const root = document.querySelector('#root')
runSaga(rootSaga)

if (process.env.NODE_ENV === 'production') {
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App/>
      </PersistGate>
    </Provider>, root)
} else {
  const render = async () => {
    const { default: App } = (await import('./components/App'))
    ReactDOM.render(
      <AppContainer>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <App/>
          </PersistGate>
        </Provider>
      </AppContainer>,
      root
    )
  }
  render()
  if (module.hot) module.hot.accept('./components/App', render)
}
