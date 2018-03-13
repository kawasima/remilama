import React, { Component } from 'react'
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom'
import { history } from '../store'
import Layout from './Layout'
import ChannelContainer from '../containers/ChannelContainer'

const Home = () => (
  <div>
    <h2>Menu</h2>

    <Link to='/channel'>Channel</Link>
  </div>
)

const App = () => {
  const routing = (
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/channel' component={ChannelContainer}/>
    </Switch>)

  return (
    <BrowserRouter history={history}>
      <Layout children={routing}/>
    </BrowserRouter>
  )
}

export default App
