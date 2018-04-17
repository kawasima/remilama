/* global FileReader */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Peer from 'peerjs'
import isArrayBuffer from 'is-array-buffer'
import PdfContainer from '../containers/PdfContainer'
import Review from '../components/Review'
import Reviewer from '../components/Reviewer'
import ReviewCommentTable from '../components/ReviewCommentTable'
import detectPort from '../utils/detectPort'
import reviewActions from '../actions/review-actions'

class RevieweeContainer extends Component {
  constructor(props) {
    super(props)
  }

  onSelectFile = filename => {
    const { fileObject, dispatch } = this.props
    const file = fileObject.find(f => f.name === filename)
    const reader = new FileReader()
    reader.onload = () => dispatch({
      type: 'REVIEWER/SHOW_FILE',
      file: {
        name: file.name,
        blob: reader.result
      }
    })
    reader.readAsArrayBuffer(file)
  }

  componentDidMount() {
    const { review, dispatch } = this.props
    dispatch(reviewActions.startReviewee({
      reviewId: review.id,
      port: detectPort(window.location)
    }))
  }

  render() {
    const props = this.props

    const documentView = isArrayBuffer(props.reviewer.file && props.reviewer.file.blob) ? (
      <PdfContainer {...props.pdf}
                    review={props.review}
                    filename={props.reviewer.file.name}
                    binaryContent={props.reviewer.file.blob}
                    onPageComplete={() => {}}
        />
    )
          :
          null

    const commentTable = (props.review.comments.length > 0) ?
          (
            <ReviewCommentTable
              comments={props.review.comments}
              customFields={props.review.customFields}
              customValues={props.review.customValues}
              onChangeCustomValue={props.onChangeCustomValue}
              onGoToPage={props.onGoToPage}
              onSelectFile={this.onSelectFile}
              />
          ) : null
    return (
      <div className="ui teal raised segment">
        <h2 className="ui header">
          <i className="comment alternate outline icon"></i>
          <div className="content">
            Review
          </div>
        </h2>
        <Review {...props.review}
                onSelectFile={this.onSelectFile}
                onReSelectFile={props.onReSelectFile}
                fileObject={props.fileObject}
                isReviewee={true}/>

        { props.review.reviewers.map( reviewer => <Reviewer key={reviewer.id} reviewer={reviewer} /> ) }
      {documentView}
      {commentTable}
        </div>
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
  (dispatch, props) => {
    return {
      onCommentAction: (action) => {
        dispatch(action)
      },
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
      onGoToPage: (page) => {
        dispatch({
          type: 'PDF/GO_PAGE',
          page: page
        })
      },
      dispatch
    }
  }
)
export default connector(RevieweeContainer)
