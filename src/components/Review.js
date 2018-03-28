import React from 'react'
import uuidv4 from 'uuid/v4'

const renderFile = ({file, onSelectFile}) => (
  <li key={uuidv4()}>
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
