import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import uuidv4 from 'uuid/v4'
import PdfDocument from '../components/PdfDocument'
import ReviewComment from '../components/ReviewComment'
import SelectReviewFile from '../components/SelectReviewFile'
import DocumentControls from '../components/DocumentControls'

function extractComments(review, reviewer, filename, page, scale) {
  if (!review) return null

  return review.comments
    .filter(comment => comment.page === page && comment.filename === filename)
    .map(comment => {
      return (
        <ReviewComment {...comment}
                       scale={scale}
                       reviewer={reviewer}
                       onMoveComment = {review.onMoveComment}
                       onUpdateComment = {review.onUpdateComment}
                       onDeleteComment = {review.onDeleteComment} />
      )
    })
}

class PdfContainer extends React.Component {
  render() {
    const {
      filename,
      page,
      scale,
      review,
      reviewer,
    } = this.props

    const comments = extractComments(review, reviewer, filename, page, scale)

    return (this.props.file || this.props.binaryContent) ?
      (
        <div>
          <DocumentControls {...this.props} />
          <div style={{
                 position: 'relative',
                 overflow: 'scroll',
                 border: '1px solid #cccccc'
               }}>
            <PdfDocument {...this.props}></PdfDocument>
            {comments}
          </div>
        </div>
      )
    :
      <SelectReviewFile {...this.props} />
  }

  static propTypes = {
    filename: PropTypes.string,
    page: PropTypes.number,
    numPages: PropTypes.number,
    scale: PropTypes.number,
    review: PropTypes.object,
    reviewer: PropTypes.object,
    file: PropTypes.object,
    binaryContent: PropTypes.instanceOf(ArrayBuffer),
    onPageClick: PropTypes.func,
  }
}

const connector = connect(
  ({ pdf }) => {
    return { ...pdf }
},
  (dispatch, props) => {
    return {
      onDocumentComplete: numPages => dispatch({
        type: 'PDF/SET_NUM_PAGES',
        numPages: numPages
      }),
      onSelectFile: file => {
        dispatch({
          type: 'PDF/SHOW',
          file: file
        })
      },
      onNext: (page) => {
        dispatch({
          type: 'PDF/GO_PAGE',
          page: page + 1
        })
      },
      onPrevious: (page) => {
        dispatch({
          type: 'PDF/GO_PAGE',
          page: page - 1
        })
      },
      onGoToPage: (page) => {
        dispatch({
          type: 'PDF/GO_PAGE',
          page: page
        })
      },
      onZoomIn: (scale) => {
        dispatch({
          type: 'PDF/SET_SCALE',
          scale: scale * 1.2
        })
      },
      onZoomOut: (scale) => {
        dispatch({
          type: 'PDF/SET_SCALE',
          scale: scale / 1.2
        })
      },
    }
  }
)
export default connector(PdfContainer)
