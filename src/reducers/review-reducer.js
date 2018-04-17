import { handleActions } from 'redux-actions'
import actions from '../actions/review-actions'

const initialState = {
  id: null,
  name: null,
  files: [],
  reviewers: [],
  comments: [],
  customFields: [],
  customValues: {}
}

export default handleActions({
  [actions.reviewCreated]: (state, action) => {
    return { ...state, ...action.payload.review }
  },
  [actions.reviewInitialized]: () => initialState,
  [actions.reviewFileAdded]: (state, action) => {
    return {
      ...state,
      files: [ ...state.files, action.payload.file ]}
  },
  [actions.reviewConnected]: (state, action) => {
    return { ...state, ...action.payload.review }
  },
  [actions.reviewCommentsPropagated]: (state, action) => {
    return { ...state, comments: action.payload.comments }
  },
  [actions.reviewFileRemoved]: (state, action) => {
    return {...state,
            files: state.files.filter(f => f.name !== action.payload.filename)}
  },
  [actions.reviewReviewerAdded]: (state, action) => {
    if (!state.reviewers.find(reviewer => reviewer.id === action.payload.id)) {
      return {
        ...state,
        reviewers: [
          ...state.reviewers,
          {
            id: action.payload.id,
            name: action.payload.name
          }
        ]
      }
    } else {
      return state
    }
  },
  [actions.reviewReviewerRemoved]: (state, action) => {
    return {
      ...state,
      reviewers: state.reviewers.filter(reviewer => reviewer.id !== action.payload.reviewerId)
    }
  },
  [actions.reviewReviewerUpdated]: (state, action) => {
    return {
      ...state,
      reviewers: state.reviewers.map(reviewer => {
        if (reviewer.id === action.payload.reviewer.id) {
          return { ...reviewer, ...action.payload.reviewer }
        } else {
          return reviewer
        }
      })
    }
  },
  [actions.reviewCommentsUpdated]: (state, action) => {
    return {
      ...state,
      comments: action.payload.comments
    }
  },
  [actions.reviewCommentAdded]: (state, action) => {
    return {
      ...state,
      comments: [...state.comments,
                 {
                   id: action.payload.id,
                   filename: action.payload.filename,
                   postedBy: action.payload.postedBy,
                   postedAt: action.payload.postedAt,
                   page: action.payload.page,
                   x: action.payload.x,
                   y: action.payload.y,
                   description: ''
                 }]
      }
  },
  [actions.reviewCommentUpdated]: (state, action) => {
    return {
      ...state,
      comments: state.comments
          .map(comment => comment.id === action.payload.id ?
               { ...comment, ...action.payload.changes }
               :
               comment)
    }
  },
  [actions.reviewCommentRemoved]: (state, action) => {
    return {
      ...state,
      comments: state.comments.filter(comment => comment.id !== action.payload.id)
    }
  },
  [actions.reviewCustomFieldsSet]: (state, action) => {
    return {
      ...state,
      customFields: action.payload.customFields
    }
  },
  [actions.reviewCustomValueSet]: (state, action) => {
    return {
      ...state,
      customValues: {...state.customValues,
                     [action.payload.commentId]: {
                       ...state.customValues[action.payload.commentId],
                       [action.payload.customFieldId]: action.payload.value
                     }
                    }
    }
  }
}, initialState)
