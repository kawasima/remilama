import { handleActions } from 'redux-actions'
import actions from '../actions/reviewee-actions'

const initialState = {
  peers: []
}

export default handleActions({
  [actions.peerConnectionAdded]: (state, action) => {
    return {
      ...state,
      peers: {...state.peers, [action.payload.reviewer.id]: action.payload.connection}
    }
  },
  [actions.peerConnectionRemoved]: (state, action) => {
    return {
      ...state,
      peers: state.peers.filter(conn => conn !== action.payload.connection )
    }
  }
}, initialState)
