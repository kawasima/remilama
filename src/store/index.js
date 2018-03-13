import { applyMiddleware, createStore } from 'redux'
import promiseMiddleware from 'redux-promise'
import { createLogger } from 'redux-logger'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducer from '../reducers'

const store = createStore(reducer, applyMiddleware(promiseMiddleware, createLogger()))
export const history = syncHistoryWithStore(createBrowserHistory(), store)

export default store
