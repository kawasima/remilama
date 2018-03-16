import React from 'react'

export default ({onSelectFile}) =>
  <input type="file" value="" onChange={
    e => onSelectFile(e.target.files.item(0))
  }/>
