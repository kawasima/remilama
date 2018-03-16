import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

export default function Layout(props) {
  return (
    <div className="ui container Layout">
      <div className="ui menu">
        <NavLink to="/" className="item">Home</NavLink>
      </div>
      {props.children}
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.object
}
