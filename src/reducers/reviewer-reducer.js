export default (state = {}, action) => {
  switch (action.type) {
  case 'JOIN_REVIEW':
    return Object.assign(
      {},
      state,
      {
        reviewId: action.reviewId,
        id: action.reviewer.id,
        name: action.reviewer.name,
      })
  case 'REVIEWER/SHOW_FILE':
    return {
      ...state,
      file: action.file
    }
  default:
    return state
  }
}
