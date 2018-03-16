const initialState = {
  id: null,
  name: null,
  files: [],
  reviewers: [],
  isStarted: false
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'CREATE_REVIEW':
    return Object.assign(
      {},
      state,
      { ...action.review })
  case 'ADD_REVIEW_FILE':
    return Object.assign(
      {},
      state,
      {
        files: [ ...state.files, action.file ]
      })
  case 'REMOVE_REVIEW_FILE':
    return Object.assign(
      {},
      state,
      {
        files: state.files.filter(f => f.name !== action.filename)
      })
  case 'ADD_REVIEWER':
    if (!(state.reviewes || []).find(reviewer => reviewer.id === action.id)) {
      return Object.assign(
        {},
        state,
        {
          reviewers: [
            ...state.reviewers,
            {
              id: action.id,
              name: action.name
            }
          ]
        })
    } else {
      return state
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
  case 'START_REVIEW':
    return { ...state, isStarted: true }
  case 'END_REVIEW':
    return { ...state, isStarted: false }
  default:
    return state
  }
}
