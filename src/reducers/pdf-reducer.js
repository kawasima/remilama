const initialState = {
  page: 1,
  scale: 1
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'PDF/SHOW':
    return {...state, file: action.file }
  case 'PDF/GO_PAGE':
    return {...state, page: action.page }
  case 'PDF/SET_SCALE':
    return {...state, scale: action.scale }
  case 'PDF/SET_NUM_PAGES':
    return {...state, numPages: action.numPages }
  default:
    return state
  }
}
