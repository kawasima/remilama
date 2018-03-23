const initialState = {
  id: null,
  name: null,
  files: [],
  reviewers: [],
  comments: []
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'CREATE_REVIEW':
    return { ...state, ...action.review }
  case 'ADD_REVIEW_FILE':
    return {
      ...state,
      files: [ ...state.files, action.file ]
    }
  case 'REMOVE_REVIEW_FILE':
    return {
      ...state,
      files: state.files.filter(f => f.name !== action.filename)
    }
  case 'REVIEW/ADD_REVIEWER':
    if (!state.reviewers.find(reviewer => reviewer.id === action.id)) {
      return {
        ...state,
        reviewers: [
          ...state.reviewers,
          {
            id: action.id,
            name: action.name,
            dataConnection: action.dataConnection
          }
        ]
      }
    } else {
      return state
    }
  case 'REVIEW/REMOVE_REVIEWER':
    return {
      ...state,
      reviewers: state.reviewers.filter(reviewer => reviewer.id !== action.reviewerId)
    }
  case 'UPDATE_REVIEWER':
    return {
      ...state,
      reviewers: state.reviewers.map(reviewer => {
        if (reviewer.id === action.reviewer.id) {
          return { ...reviewer, ...action.reviewer }
        } else {
          return reviewer
        }
      })
    }
  case 'REVIEW/UPDATE_COMMENTS':
    return {
      ...state,
      comments: action.comments
    }
  case 'REVIEW/ADD_COMMENT':
    return {
      ...state,
      comments: [...state.comments,
                 {
                   id: action.id,
                   filename: action.filename,
                   postedBy: action.postedBy,
                   postedAt: action.postedAt,
                   page: action.page,
                   x: action.x,
                   y: action.y,
                   description: ''
                 }]
      }
  case 'REVIEW/UPDATE_COMMENT':
    return {
      ...state,
      comments: state.comments
          .map(comment => comment.id === action.id ?
               { ...comment, ...action.changes }
               :
               comment)
    }
  case 'REVIEW/REMOVE_COMMENT':
    return {
      ...state,
      comments: state.comments.filter(comment => comment.id !== action.id)
    }
  default:
    return state
  }
}
