import React from 'react'
import Peer from 'peerjs'

const renderFile = ({file, onSelectFile}) => (
  <li key={file.name}>
    <a onClick={(e) => onSelectFile(file.name)}
      style={{cursor: 'pointer'}}>
      {file.name}
    </a>
  </li>
)
export default ({ id, name, files, onSelectFile }) => {
  return (
    <div className="ui raised segment">
      <p>Review: {name} ({id})</p>

      <div>
        <ul>
          { files.map(file => renderFile({file, onSelectFile}))}
        </ul>
      </div>
    </div>
  )
}
