import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch, Link, withRouter } from 'react-router-dom'
import { history } from '../store'
import Layout from './Layout'
import ChannelContainer from '../containers/ChannelContainer'
import ReviewContainer from '../containers/ReviewContainer'

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
      <Route exact path='/xxx/:id' component={ReviewContainer}/>
      <Route path='/channel' component={ChannelContainer}
             onChannelCreate={(state, replace) => state}/>
    </Switch>)

  return (
    <Router history={history}>
      <Layout children={routing}/>
    </Router>
  )
}

export default App
