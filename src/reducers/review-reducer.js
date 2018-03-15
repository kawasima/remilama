const initialState = {
  id: null,
  name: null,
  files: [],
  isStarted: false
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'CREATE_REVIEW':
    return Object.assign(
      {},
      state,
      {
        id: action.id,
        name: action.name,
        files: action.files || []
      })
  case 'ADD_REVIEW_FILE':
    return Object.assign(
      {},
      state,
      {
        files: [ ...state.files, action.file ]
      })
  case 'JOIN_REVIEW':
    return Object.assign(
      {},
      initialState,
      {
        id: action.id
      })
  case 'START_REVIEW':
    return { ...state, isStarted: true }
  case 'END_REVIEW':
    return { ...state, isStarted: false }
  default:
    return state
  }
}
