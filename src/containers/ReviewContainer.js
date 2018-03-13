import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import React from 'react'
import Review from '../components/Review'
import { history } from '../store'

function ReviewContainer(props) {
  return (
    <Review {...props} />
  )
}

const connector = connect(
  ({ channel }) => channel,
  (dispatch) => {
    return {
    }
  }
)
export default withRouter(connector(ReviewContainer))
