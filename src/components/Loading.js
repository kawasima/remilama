import React from 'react'

const Loading = ({ connected }) => {
  if (connected) return null

  return(
    <div className="ui active dimmer">
      <div className="ui large text loader">Loading</div>
    </div>
  )
}

export default Loading
