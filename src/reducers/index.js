import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import channel from './channel-reducer'

export default combineReducers({
  channel,
  routing: routerReducer
})
