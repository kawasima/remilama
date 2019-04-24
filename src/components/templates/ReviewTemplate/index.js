import React from 'react'
import PropTypes from 'prop-types'
import isArrayBuffer from 'is-array-buffer'
import { required, composeValidators, mustBeUUID } from '../../../validators'

import Loading from '../../atoms/Loading'
import Reviewer from '../../molecules/Reviewer'
import ReviewCommentTable from '../../molecules/ReviewCommentTable'
import ReviewSummary from '../../organisms/ReviewSummary'
import ReviewDocumentViewer from '../../organisms/ReviewDocumentViewer'

const renderJoinForm = ({ handleSubmit, pristine, invalid }) => {
    const { reviewer } = this.props
    return (
      <form className="ui form" onSubmit={handleSubmit}>
        <div className="fields">
          <Field component="input" name="review_id"
                 validate={composeValidators(required, mustBeUUID)}
                 type="hidden" value={reviewer ? reviewer.reviewId : null }>
          </Field>
          <ReviewerNameField />
          <div className="field">
            <label>&nbsp;</label>
            <button type="submit"
                    className="ui primary button"
                    disabled={pristine || invalid}>Join</button>
          </div>
        </div>
      </form>
    )
}


const reviewerModalView = ({ reviewer, dispatch, onJoinReview }) =>
      (reviewer && reviewer.reviewId !== reviewer.reviewId) ?
      (
        <Modal modalIsOpen={true}>
          <div className="header">{reviewer ? reviewer.reviewId : null}</div>
          <div className="content">
            <Form
              initialValues={{}}
              onSubmit={onJoinReview}
              render={renderJoinForm}/>
          </div>
        </Modal>
      ) : null


const renderDocumentView = (props) => isArrayBuffer(props.reviewer.file && props.reviewer.file.blob) ?
      (
        <ReviewDocumentViewer
          {...props.pdf}
          review={props.review}
          reviewer={props.reviewer}
          filename={props.reviewer.file.name}
          fileObject={props.fileObject}
          binaryContent={props.reviewer.file.blob}
          onZoomIn={props.onZoomIn}
          onZoomOut={props.onZoomOut}
          onNext={props.onNext}
          onPrevious={props.onPrevious}
          onMoveComment={props.onMoveComment}
          onUpdateComment={props.onUpdateComment}
          onDeleteComment={props.onDeleteComment}
          onPageComplete={props.onPageComplete}
          onPageClick={(filename, page, x, y, scale) => props.onPostComment(filename, page, x, y, scale, props.reviewer)} />
      )
      :
      null

const renderCommentTable = (props) => (props.review.comments.length > 0) ?
      (
        <ReviewCommentTable
          comments={props.review.comments}
          customFields={props.review.customFields}
          customValues={props.review.customValues}
          onChangeCustomValue={props.onChangeCustomValue}
          onGoToPage={props.onGoToPage}
          onSelectFile={filename => props.onSelectFile(filename, props.fileObject)}
          />
      ) : null

const renderLoading = (props) => {
  if (props.isReviewer && !(props.reviewer || {}).connected) {
    return (<Loading/>)
  }
  return null
}

const renderReviewers = (reviewers) => {
  return reviewers.map(reviewer => <Reviewer key={reviewer.id} reviewer={reviewer} /> )
}

const ReviewTemplate = (props) => (
  <div className="ui teal raised segment">
    <h2 className="ui header">
      <i className="comment alternate outline icon"></i>
      <div className="content">
        Review
      </div>
    </h2>
    {renderLoading(props)}

    <ReviewSummary
      {...props.review}
      onSelectFile={props.onSelectFile}
      onReSelectFile={props.onReSelectFile}
      fileObject={props.fileObject}
      isReviewer={props.isReviewer}/>

    {renderReviewers(props.review.reviewers)}
    {renderDocumentView(props)}
    {renderCommentTable(props)}
    {reviewerModalView(props)}
  </div>
)

export default ReviewTemplate
