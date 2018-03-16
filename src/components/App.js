import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'

import { history } from '../store'
import Layout from './Layout'
import HomeContainer from '../containers/HomeContainer'
import ReviewerContainer from '../containers/ReviewerContainer'
import RevieweeContainer from '../containers/RevieweeContainer'
import ReviewCreateFormContainer from '../containers/ReviewCreateFormContainer'

import PdfContainer from '../containers/PdfContainer'

const App = () => {
  const routing = (
    <Switch>
      <Route exact path='/' component={HomeContainer} />
      <Route path='/review/new' component={ReviewCreateFormContainer}/>
      <Route path='/review/:id/reviewer' component={ReviewerContainer}/>
      <Route path='/review/:id' component={RevieweeContainer}/>
      <Route exact path='/pdf' component={PdfContainer}/>
    </Switch>)

  return (
    <Router>
      <Layout children={routing}/>
    </Router>
  )
}

export default DragDropContext(HTML5Backend)(App)
