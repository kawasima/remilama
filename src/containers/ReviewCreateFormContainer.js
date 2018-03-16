import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReviewCreateForm from '../components/ReviewCreateForm'
import uuidv4 from 'uuid/v4'

function ReviewCreateFormContainer(props) {
  return (
    <div>
      <h2 className="ui header">
        <i className="plug icon"></i>
        <div className="content">
          Create a New Review
        </div>
      </h2>
      <ReviewCreateForm {...props} />
    </div>
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
          review: {
            id: id,
            name: values.review_name
          }
        })
        props.history.push('/review/' + id)
      },
      onSelectFile: file => {
        if (file) {
          dispatch({
            type: 'ADD_REVIEW_FILE',
            file: file
          })
        }
      },
      onRemoveFile: filename => {
        if (filename) {
          dispatch({
            type: 'REMOVE_REVIEW_FILE',
            filename: filename
          })
        }
      }
    }
  }
)
export default withRouter(connector(ReviewCreateFormContainer))
