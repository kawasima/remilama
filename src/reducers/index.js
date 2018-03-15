import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import channel from './channel-reducer'
import review from './review-reducer'

export default combineReducers({
  review,
  channel,
  routing: routerReducer
})
