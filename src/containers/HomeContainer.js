import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import React from 'react'
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
          id: values.review_id
        })
      }
    }
  }
)
export default withRouter(connector(HomeContainer))
