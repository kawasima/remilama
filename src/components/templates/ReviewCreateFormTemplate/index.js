import React from 'react'
import ReviewCreateForm from '../../organisms/ReviewCreateForm'

const ReviewCreateFormTemplate = (props) => (
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

export default ReviewCreateFormTemplate
