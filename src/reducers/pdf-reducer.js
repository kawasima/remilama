import { handleActions } from 'redux-actions'
import actions from '../actions/pdf-actions'

const initialState = {
  page: 1,
  scale: 1,
  fillWidth: true,
  fillHeight: true
}

export default handleActions({
  [actions.pdfShow]: (state, action) => {
    return {...state, file: action.payload.file }
  },
  [actions.pdfPageGo]: (state, action) => {
    return {...state, page: action.payload.page }
  },
  [actions.pdfScaleSet]: (state, action) => {
    return {
      ...state,
      scale: action.payload.scale,
      fillWidth: false,
      fillHeight: false
    }
  },
  [actions.pdfNumPagesSet]: (state, action) => {
    return {...state, numPages: action.payload.numPages }
  },
}, initialState)
