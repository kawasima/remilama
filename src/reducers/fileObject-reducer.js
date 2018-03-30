export default (state = [], action) => {
  switch (action.type) {
  case 'FILE_OBJECT/ADD_FILE':
    return [ ...state, action.file ]
  case 'FILE_OBJECT/REMOVE_FILE':
    return state.filter(f => f.name !== action.filename)
  default:
    return state
  }
}
