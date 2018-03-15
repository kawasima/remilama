import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import channel from './channel-reducer'
import review from './review-reducer'
import pdf from './pdf-reducer'

export default combineReducers({
  review,
  pdf,
  channel,
  routing: routerReducer
})
