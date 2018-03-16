const initialState = {
  page: 1,
  comments: []
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'SHOW_PDF':
    return {...state, file: action.file }
  case 'GO_PAGE':
    return {...state, page: action.page }
  case 'ADD_COMMENT':
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
  case 'CANVAS_OFFSET':
    return {
      ...state,
      offsetTop: action.offsetTop,
      offsetLeft: action.offsetLeft
    }
  case 'UPDATE_COMMENT':
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
  case 'REMOVE_COMMENT':
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
