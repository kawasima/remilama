/* global window */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import detectPort from '../../../utils/detectPort'
import reviewActions from '../../../actions/review-actions'
import pdfActions from '../../../actions/pdf-actions'
import ReviewTemplate from '../../templates/ReviewTemplate'

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
    return (
      <ReviewTemplate isReviewer={true}
                      {...this.props} />
    )
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
  dispatch => {
    return {
      onDocumentComplete: numPages => dispatch(pdfActions.pdfNumPagesSet({ numPages })),
      onNext: page => dispatch(pdfActions.pdfPageGo({ page: page + 1 })),
      onPrevious: page => dispatch(pdfActions.pdfPageGo({ page: page - 1 })),
      onGoToPage: page => dispatch(pdfActions.pdfPageGo({ page })),
      onZoomIn: scale => dispatch(pdfActions.pdfScaleSet({ scale: scale * 1.2 })),
      onZoomOut: scale => dispatch(pdfActions.pdfScaleSet({ scale: scale / 1.2 })),

      onDeleteComment: id => dispatch(reviewActions.reviewCommentRemoveRequest({
        id: id
      })),
      onPageComplete: (filename, page, reviewer) => {
        dispatch(reviewActions.reviewReviewerUpdateRequest({
          reviewer: {
            id: reviewer.id,
            action: `Show the ${page} page on ${filename}`
          }
        }))
      },
      onSelectFile: filename => dispatch(reviewActions.reviewFileRequest({
        filename: filename
      })),
      onPostComment: (filename, page, x, y, scale, reviewer) =>
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
