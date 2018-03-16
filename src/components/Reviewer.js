import React from 'react'

export default ({reviewer}) => (
  <div className="item">
    <div className="content">
      <img className="ui avatar image" src="https://www.gravatar.com/avatar/0000?d=mm" />
      <a className="header">{reviewer.name}</a>
      <span>{reviewer.action}</span>
    </div>
  </div>
)
