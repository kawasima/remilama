import React from 'react'

const ReviewCreateNavigation = ({ onNewReview }) => (
  <div className="ui raised segment">
    <div className="ui header">Reviewee</div>
    <div className="description">
      Create a review
      <div>
        <a className="ui primary button" onClick={onNewReview}>Create</a>
      </div>
    </div>
  </div>
)

export default ReviewCreateNavigation
