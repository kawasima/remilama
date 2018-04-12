import { handleActions } from 'redux-actions'
import * as Actions from '../actions/review-actions'

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
  [Actions.reviewCreated]: (state, action) => {
    return { ...state, ...action.payload.review }
  },
  [Actions.reviewInitialized]: () => initialState,
  [Actions.reviewFileAdded]: (state, action) => {
    return {
      ...state,
      files: [ ...state.files, action.payload.file ]}
  },
  [Actions.reviewFileRemoved]: (state, action) => {
    return {...state,
            files: state.files.filter(f => f.name !== action.payload.filename)}
  },
  [Actions.reviewReviewerAdded]: (state, action) => {
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
  [Actions.reviewReviewerRemoved]: (state, action) => {
    return {
      ...state,
      reviewers: state.reviewers.filter(reviewer => reviewer.id !== action.payload.reviewerId)
    }
  },
  [Actions.reviewReviewerUpdated]: (state, action) => {
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
  [Actions.reviewCommentsUpdated]: (state, action) => {
    return {
      ...state,
      comments: action.payload.comments
    }
  },
  [Actions.reviewCommentAdded]: (state, action) => {
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
  [Actions.reviewCommentUpdated]: (state, action) => {
    return {
      ...state,
      comments: state.comments
          .map(comment => comment.id === action.payload.id ?
               { ...comment, ...action.payload.changes }
               :
               comment)
    }
  },
  [Actions.reviewCommentRemoved]: (state, action) => {
    return {
      ...state,
      comments: state.comments.filter(comment => comment.id !== action.payload.id)
    }
  },
  [Actions.reviewCustomFieldsSet]: (state, action) => {
    return {
      ...state,
      customFields: action.payload.customFields
    }
  },
  [Actions.reviewCustomValueSet]: (state, action) => {
    return {
      ...state,
      customValues: {...state.customValues,
                     [action.payload.commentId]: {
                       ...state.customValues[action.payload.commentId],
                       [action.payload.customFieldId]: action.payload.value
                     }
                    }
    }
  },
  [Actions.reviewConnectFail]: (state, action) => {
    console.error('CONNECT FAIL!!!!!!!')
    return state
  }
}, initialState)
