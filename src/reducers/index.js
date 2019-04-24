import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import review from './review-reducer'
import reviewer from './reviewer-reducer'
import reviewee from './reviewee-reducer'
import pdf from './pdf-reducer'
import fileObject from './fileObject-reducer'

export default combineReducers({
  reviewer,
  reviewee,
  review,
  pdf,
  fileObject,
  routing: routerReducer
})
