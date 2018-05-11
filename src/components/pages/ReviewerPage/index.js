import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import isArrayBuffer from 'is-array-buffer'
import ReviewSummary from '../../atoms/ReviewSummary'
import Modal from '../../Modal'
import Loading from '../../atoms/Loading'
import ReviewerNameField from '../atoms/ReviewerNameField'
import { Form, Field } from 'react-final-form'
import detectPort from '../utils/detectPort'
import reviewActions from '../actions/review-actions'

class ReviewerPage extends React.Component {
  static propTypes = {
    review: PropTypes.object.isRequired,
    reviewer: PropTypes.object.isRequired,
    pdf: PropTypes.object,
  }

  componentDidMount() {
    const props = this.props

    props.dispatch(reviewActions.startReviewer({
      port: detectPort(window.location),
      reviewId: props.match.params.id
    }))
  }

  render() {
    return (<ReviewTemplate {...props}/>)
  }
}

const connector = connect(
  ({ review, reviewer, pdf }) => {
    return {
      review,
      reviewer,
      pdf
    }
  },
  (dispatch, ownProps) => {
    return {
      onDeleteComment: id => dispatch(reviewActions.reviewCommentRemoveRequest({
        id: id
      })),
      onPageComplete: (filename, page) => {
        dispatch(reviewActions.reviewReviewerUpdateRequest({
          reviewer: {
            id: ownProps.reviewer.id,
            action: `Show the ${page} page on ${filename}`
          }
        }))
      },
      onSelectFile = filename => dispatch(reviewActions.reviewFileRequest({
        filename: filename
      })),
      onPostComment: (filename, page, x, y, scale) =>
        dispatch(reviewActions.reviewCommentAddRequest({
          id: uuidv4(),
          postedAt: new Date().getTime(),
          postedBy: {
            id: reviewer.id,
            name: reviewer.name
          },
          x: x / scale,
          y: y / scale,
          page: page,
          filename: filename
        })),
      onUpdateComment: (id, description) =>
        dispatch(reviewActions.reviewCommentUpdateRequest({
          id: id,
          changes: {
            description: description
          }
        })),
      onMoveComment: ({id, x, y}) =>
        dispatch(reviewActions.reviewCommentUpdateRequest({
          id: id,
          changes: {
            x: x,
            y: y
          }
        })),
      onJoinReview: (values) => dispatch(reviewActions.reviewJoinRequest({
          reviewId: values.review_id,
          reviewer: {
            id: uuidv4(),
            name: values.reviewer_name
          }
      })),
      dispatch
    }
  }
)
export default connector(ReviewerPage)
