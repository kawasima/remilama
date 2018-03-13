import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Layout(props) {
  return (
    <div className='Layout'>
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
      </ul>
      <hr/>
      {props.children}
    </div>
  )
}
