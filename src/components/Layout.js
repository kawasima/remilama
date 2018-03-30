import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

export default function Layout(props) {
  return (
    <div>
      <div className="ui secondary menu">
        <div className="ui container">
          <div className="item">Remilama</div>
          <NavLink to="/" className="item">Home</NavLink>
        </div>
      </div>
      <div className="ui main container Layout">
        {props.children}
      </div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.object
}
