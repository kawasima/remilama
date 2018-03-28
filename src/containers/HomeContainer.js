import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import Home from '../components/Home'

function HomeContainer(props) {
  return (
    <Home {...props} />
  )
}

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onJoinReview: (values, form, cb) => {
        props.history.push('/review/' + values.review_id + '/reviewer')
        dispatch({
          type: 'JOIN_REVIEW',
          reviewId: values.review_id,
          reviewer: {
            id: uuidv4(),
            name: values.reviewer_name
          }
        })
      },
      onNewReview: e => {
        props.history.push('/review/new')
        dispatch({
          type: 'REVIEW/INITIALIZE'
        })
      }
    }
  }
)
export default withRouter(connector(HomeContainer))
