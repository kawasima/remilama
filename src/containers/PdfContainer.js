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
                           onPostComment = {props.onPostComment}
                           offsetTop={props.offsetTop}
                           offsetLeft={props.offsetLeft} />
          )
        })
  return props.file ?
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
          x: x - (props.offsetLeft || 0),
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
          description: description
        })
      }
    }
  }
)
export default connector(PdfContainer)
