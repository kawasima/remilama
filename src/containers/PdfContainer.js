import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import uuidv4 from 'uuid/v4'
import PdfDocument from '../components/PdfDocument'
import ReviewComment from '../components/ReviewComment'
import SelectReviewFile from '../components/SelectReviewFile'

function PdfContainer(props) {
  const comments = props.comments
        .filter(comment => comment.page == props.page)
        .map(comment => {
          return (
            <ReviewComment {...comment}
                           onMoveComment = {props.onMoveComment}
                           onPostComment = {props.onPostComment}
                           onDeleteComment = {props.onDeleteComment}
                           offsetTop={props.offsetTop}
                           offsetLeft={props.offsetLeft} />
          )
        })
  return (props.file || props.binaryContent) ?
    (
      <div>
        <PdfDocument {...props}/>
        {comments}
      </div>
    )
    :
    <SelectReviewFile {...props} />
}

const connector = connect(
  ({ pdf }) => pdf,
  (dispatch, props) => {
    return {
      onSelectFile: file => {
        dispatch({
          type: 'SHOW_PDF',
          file: file
        })
      },
      onNext: (page) => {
        dispatch({
          type: 'GO_PAGE',
          page: page + 1
        })
      },
      onPrevious: (page) => {
        dispatch({
          type: 'GO_PAGE',
          page: page - 1
        })
      },
      onPageClick: (x, y, page) => {
        dispatch({
          type: 'ADD_COMMENT',
          id: uuidv4(),
          x: x,
          y: y - (props.offsetTop || 0),
          page: page
        })
      },
      onRenderedCanvas: (offsetTop, offsetLeft) => {
        if (!props.offsetTop) {
          dispatch({
            type: 'CANVAS_OFFSET',
            offsetTop: offsetTop,
            offsetLeft: offsetLeft
          })
        }
      },
      onPostComment: (id, description) => {
        dispatch({
          type: 'UPDATE_COMMENT',
          id: id,
          changes: {
            description: description
          }
        })
      },
      onMoveComment: ({id, x, y}) => {
        dispatch({
          type: 'UPDATE_COMMENT',
          id: id,
          changes: {
            x: x,
            y: y
          }
        })
      },
      onDeleteComment: (id) => {
        dispatch({
          type: 'REMOVE_COMMENT',
          id: id
        })
      }
    }
  }
)
export default connector(PdfContainer)
