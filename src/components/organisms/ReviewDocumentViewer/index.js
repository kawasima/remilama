import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import DocumentControls from '../../molecules/DocumentControls'
import ReviewComment from '../../molecules/ReviewComment'
import PdfDocument from '../../atoms/PdfDocument'

function extractComments({ review, reviewer, filename, page, scale }) {
  if (!review) return null

  return review.comments
    .filter(comment => comment.page === page && comment.filename === filename)
    .map(comment => {
      return (
        <ReviewComment {...comment}
                       key={comment.id}
                       scale={scale}
                       reviewer={reviewer}
                       onMoveComment = {review.onMoveComment}
                       onUpdateComment = {review.onUpdateComment}
                       onDeleteComment = {review.onDeleteComment} />
      )
    })
}

const Wrapper = styled.div`
  position: relative;
  overflow: scroll;
  border: 1px solid #cccccc;
`

const ReviewDocumentViewer = (props) => (props.file || props.binaryContent) ?
      (
        <div>
          <DocumentControls {...props} />
          <Wrapper>
            <PdfDocument {...props} />
            {extractComments(props)}
          </Wrapper>
        </div>
      )
      :
      null

ReviewDocumentViewer.propTypes = {
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

export default ReviewDocumentViewer
