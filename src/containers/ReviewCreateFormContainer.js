import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReviewCreateForm from '../components/ReviewCreateForm'
import uuidv4 from 'uuid/v4'

function ReviewCreateFormContainer(props) {
  return (
    <ReviewCreateForm {...props} />
  )
}

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onCreateReview: (values, form, cb) => {
        const id = uuidv4()
        dispatch({
          type: 'CREATE_REVIEW',
          id: id,
          name: values.review_name
        })
        props.history.push('/review/' + id)
      }
    }
  }
)
export default withRouter(connector(ReviewCreateFormContainer))
