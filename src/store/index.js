import { applyMiddleware, createStore } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import promiseMiddleware from 'redux-promise'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'

import reducer from '../reducers'

const persistConfig = {
  key: 'review',
  storage,
  whitelist: ['review', 'reviewer']
}

const browserHistory = createBrowserHistory()
const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(
  persistedReducer,
  applyMiddleware(
    routerMiddleware(browserHistory),
    promiseMiddleware,
    createLogger()))

const persistor = persistStore(store)

export {
  store,
  persistor
}
