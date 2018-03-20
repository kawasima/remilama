import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import uuidv4 from 'uuid/v4'
import PdfDocument from '../components/PdfDocument'
import ReviewComment from '../components/ReviewComment'
import SelectReviewFile from '../components/SelectReviewFile'
import DocumentControls from '../components/DocumentControls'

function PdfContainer(props) {
  const comments = props.comments
        .filter(comment => comment.page == props.page)
        .map(comment => {
          return (
            <ReviewComment {...comment}
                           scale={props.scale}
                           onMoveComment = {props.onMoveComment}
                           onPostComment = {props.onPostComment}
                           onDeleteComment = {props.onDeleteComment} />
          )
        })
  return (props.file || props.binaryContent) ?
    (
      <div>
        <DocumentControls {...props} />
        <div style={{position: 'relative'}}>
          <PdfDocument {...props}/>
          {comments}
        </div>
      </div>
    )
    :
    <SelectReviewFile {...props} />
}

const connector = connect(
  ({ pdf }) => pdf,
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
      onPageClick: (x, y, page, scale) => {
        dispatch({
          type: 'PDF/ADD_COMMENT',
          id: uuidv4(),
          x: x / scale,
          y: y / scale,
          page: page
        })
      },
      onPostComment: (id, description) => {
        dispatch({
          type: 'PDF/UPDATE_COMMENT',
          id: id,
          changes: {
            description: description
          }
        })
      },
      onMoveComment: ({id, x, y}) => {
        dispatch({
          type: 'PDF/UPDATE_COMMENT',
          id: id,
          changes: {
            x: x,
            y: y
          }
        })
      },
      onDeleteComment: (id) => {
        dispatch({
          type: 'PDF/REMOVE_COMMENT',
          id: id
        })
      }
    }
  }
)
export default connector(PdfContainer)
