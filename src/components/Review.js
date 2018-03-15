import React from 'react'
import Peer from 'peerjs'

export default ({ id, name, onSelectFile }) => {
  return (
    <div className="ui raised segment">
      <p>Review: {name} ({id})</p>
    </div>
  )
}
