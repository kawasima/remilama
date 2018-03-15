import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch, Link, withRouter } from 'react-router-dom'
import { history } from '../store'
import Layout from './Layout'
import HomeContainer from '../containers/HomeContainer'
import ReviewerContainer from '../containers/ReviewerContainer'
import RevieweeContainer from '../containers/RevieweeContainer'
import ReviewCreateFormContainer from '../containers/ReviewCreateFormContainer'

import PdfDocument from '../components/PdfDocument'

const App = () => {
  const routing = (
    <Switch>
      <Route exact path='/' component={HomeContainer} />
      <Route path='/review/new' component={ReviewCreateFormContainer}/>
      <Route path='/review/:id/reviewer' component={ReviewerContainer}/>
      <Route path='/review/:id' component={RevieweeContainer}/>
      <Route path='/pdf' component={PdfDocument}/>
    </Switch>)

  return (
    <Router>
      <Layout children={routing}/>
    </Router>
  )
}

export default App
