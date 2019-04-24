import { applyMiddleware, createStore } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import promiseMiddleware from 'redux-promise'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import isEqual from 'lodash/isEqual'
import createSagaMiddleware from 'redux-saga'
import reducer from '../reducers'
import revieweeActions from '../actions/reviewee-actions'

const persistConfig = {
  key: 'review',
  storage,
  whitelist: ['review', 'reviewer']
}

const browserHistory = createBrowserHistory()

const persistedReducer = persistReducer(persistConfig, reducer)

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  persistedReducer,
  applyMiddleware(
    sagaMiddleware,
    routerMiddleware(browserHistory),
    promiseMiddleware,
    createLogger()))

let currentComments = []
store.subscribe(() => {
  let prevComments = currentComments
  currentComments = store.getState().review.comments

  if (!isEqual(currentComments, prevComments)) {
    store.dispatch(revieweeActions.broadcastToPeers())
  }
})
export const persistor = persistStore(store)
export const runSaga = sagaMiddleware.run

export default store
