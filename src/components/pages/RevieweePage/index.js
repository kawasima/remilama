/* global FileReader */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import reviewActions from '../../../actions/review-actions'
import reviewerActions from '../../../actions/reviewer-actions'
import pdfActions from '../../../actions/pdf-actions'

class RevieweeContainer extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { review, dispatch } = this.props
    dispatch(reviewActions.startReviewee({
      reviewId: review.id,
      port: detectPort(window.location)
    }))
  }

  render() {
    return (
      <ReviewTemplate {...this.props} />
    )
  }

  static propTypes = {
    reviewer: PropTypes.object,
    review: PropTypes.object,
    pdf: PropTypes.object,
    fileObject: PropTypes.array,
    onChangeCustomValue: PropTypes.func,
    onGoToPage: PropTypes.func
  }
}


const connector = connect(
  ({ review, reviewer, pdf, fileObject }) => {
    return { review, reviewer, pdf, fileObject }
  },
  dispatch => {
    return {
      onDocumentComplete: numPages => dispatch(pdfActions.pdfNumPagesSet({ numPages })),
      onSelectFile: file => dispatch(pdfActions.pdfShow({ file })),
      onNext: page => dispatch(pdfActions.pdfPageGo({ page: page + 1 })),
      onPrevious: page => dispatch(pdfActions.pdfPageGo({ page: page - 1 })),
      onGoToPage: page => dispatch(pdfActions.pdfPageGo({ page })),
      onZoomIn: scale => dispatch(pdfActions.pdfScaleSet({ scale: scale * 1.2 })),
      onZoomOut: scale => dispatch(pdfActions.pdfScaleSet({ scale: scale / 1.2 })),
      onCommentAction: (action) => dispatch(action),
      onChangeCustomValue: (commentId, customFieldId, value) => {
        dispatch({
          type: 'REVIEW/SET_CUSTOM_VALUE',
          commentId,
          customFieldId,
          value
        })
      },
      onReSelectFile: (file) => {
        if (file) {
          dispatch({
            type: 'FILE_OBJECT/ADD_FILE',
            file: file
          })
        }
      },
      dispatch
    }
  }
)
export default connector(RevieweeContainer)
