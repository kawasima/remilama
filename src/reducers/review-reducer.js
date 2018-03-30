const initialState = {
  id: null,
  name: null,
  files: [],
  reviewers: [],
  comments: [],
  customFields: [
    {
      id: 'fixes',
      label: 'Fixes',
      type: 'text'
    },
    {
      id: 'cause',
      label: 'Cause',
      type: 'dropdown',
      source: ['Carelessly', 'Malicious']
    },
  ],
  customValues: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'REVIEW/CREATE_REVIEW':
    return { ...state, ...action.review }
  case 'REVIEW/INITIALIZE':
    return initialState
  case 'REVIEW/ADD_REVIEW_FILE':
    return {
      ...state,
      files: [ ...state.files, action.file ]
    }
  case 'REVIEW/REMOVE_REVIEW_FILE':
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
            name: action.name
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
  case 'REVIEW/SET_CUSTOM_FIELDS':
    return {
      ...state,
      customFields: action.customFields
    }
  case 'REVIEW/SET_CUSTOM_VALUE':
    return {
      ...state,
      customValues: {...state.customValues,
                     [action.commentId]: {
                       ...state.customValues[action.commentId],
                       [action.customFieldId]: action.value
                     }
                    }
    }
  default:
    return state
  }


}
