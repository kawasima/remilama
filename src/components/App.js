import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'

import Layout from './Layout'
import HomePage from '../pages/HomePage'
import ReviewerPage from '../pages/ReviewerPage'
import RevieweePage from '../pages/RevieweePage'
import ReviewCreateFormPage from '../pages/ReviewCreateFormPage'

const App = () => {
  const routing = (
    <Switch>
      <Route exact path='/' component={HomePage} />
      <Route path='/review/new' component={ReviewCreateFormPage}/>
      <Route path='/review/:id/reviewer' component={ReviewerPage}/>
      <Route path='/review/:id' component={RevieweePage}/>
    </Switch>)

  return (
    <Router>
      <Layout children={routing}/>
    </Router>
  )
}

export default DragDropContext(HTML5Backend)(App)
