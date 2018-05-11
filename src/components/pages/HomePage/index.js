import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import Home from '../../templates/HomeTemplate'
import reviewActions from '../actions/review-actions'
import reviewerActions from '../actions/reviewer-actions'

const HomePage = (props) => (
  <HomeTemplate {...props} />
)

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onJoinReview: (values, form, cb) => {
        props.history.push('/review/' + values.review_id + '/reviewer')
        dispatch(reviewerActions.reviewerJoin({
          id: uuidv4(),
          name: values.reviewer_name,
          reviewId: values.review_id
        }))
      },
      onNewReview: e => {
        props.history.push('/review/new')
        dispatch(reviewActions.reviewInitialized())
      }
    }
  }
)
export default withRouter(connector(HomePage))
