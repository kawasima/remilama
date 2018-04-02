/* global FileReader */
import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReviewCreateForm from '../components/ReviewCreateForm'
import uuidv4 from 'uuid/v4'

function ReviewCreateFormContainer(props) {
  return (
    <div className="ui teal segment">
      <h2 className="ui header">
        <i className="edit outline icon"></i>
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
      onCreateReview: (values) => {
        const id = uuidv4()
        dispatch({
          type: 'REVIEW/CREATE_REVIEW',
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
            type: 'REVIEW/ADD_REVIEW_FILE',
            file: { name: file.name, size: file.size }
          })
          dispatch({
            type: 'FILE_OBJECT/ADD_FILE',
            file: file
          })
        }
      },
      onRemoveFile: filename => {
        if (filename) {
          dispatch({
            type: 'REVIEW/REMOVE_REVIEW_FILE',
            filename: filename
          })
          dispatch({
            type: 'FILE_OBJECT/REMOVE_FILE',
            filename: filename
          })
        }
      },
      onUploadCustomFields: file => {
        const reader = new FileReader()
        reader.onload = e => {
          dispatch({
            type: 'REVIEW/SET_CUSTOM_FIELDS',
            customFields: JSON.parse(e.target.result)
          })
        }
        reader.readAsText(file)
      }
    }
  }
)
export default withRouter(connector(ReviewCreateFormContainer))
