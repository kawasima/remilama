const initialState = {
  channels: []
}

export default (state = initialState, action) => {
  switch (action.type) {
  case 'ADD_CHANNEL':
    return Object.assign(
      {},
      state,
      {
        channels: [ ...state.channels,
                    {
                      name: action.name
                    }
                  ]
      })
  default:
    return state
  }
}
