const initialState = {
  page: 1,
  scale: 1,
  comments: []
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
  case 'PDF/ADD_COMMENT':
    return Object.assign(
      {},
      state,
      {
        comments: [...state.comments,
                   {
                     id: action.id,
                     page: action.page,
                     x: action.x,
                     y: action.y,
                     description: ''
                   }]
      })
  case 'PDF/UPDATE_COMMENT':
    return Object.assign(
      {},
      state,
      {
        comments: state.comments
          .map(comment => comment.id === action.id ?
               { ...comment, ...action.changes }
               :
               comment)
      })
  case 'PDF/REMOVE_COMMENT':
    return Object.assign(
      {},
      state,
      {
        comments: state.comments.filter(comment => comment.id !== action.id)
      })
  default:
    return state
  }
}
