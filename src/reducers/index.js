import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import review from './review-reducer'
import reviewer from './reviewer-reducer'
import pdf from './pdf-reducer'

export default combineReducers({
  reviewer,
  review,
  pdf,
  routing: routerReducer
})
