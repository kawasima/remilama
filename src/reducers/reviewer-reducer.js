import { handleActions } from 'redux-actions'
import actions from '../actions/reviewer-actions'

const initialState = {
  reviewId: null,
  id: null,
  name: null,
  file: null,
  connected: false
}

export default handleActions({
  [actions.reviewerJoin]: (state, action) => {
    return {
      ...state,
      reviewId: action.payload.reviewId,
      id: action.payload.reviewer.id,
      name: action.payload.reviewer.name,
    }
  },
  [actions.reviewerConnectFail]: (state, action) => {
    return { ...state, connected: false }
  },
  [actions.reviewerConnected]: (state, action) => {
    return { ...state, connected: true }
  },
  [actions.reviewerShowFile]: (state, action) => {
    return {
      ...state,
      file: action.payload.file
    }
  }
}, initialState)
