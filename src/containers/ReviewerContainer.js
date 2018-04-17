import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import isArrayBuffer from 'is-array-buffer'
import Review from '../components/Review'
import PdfContainer from '../containers/PdfContainer'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import { Form, Field } from 'react-final-form'
import ReviewerNameField from '../components/ReviewerNameField'
import { required, composeValidators, mustBeUUID } from '../validators'
import detectPort from '../utils/detectPort'
import reviewActions from '../actions/review-actions'

class ReviewerContainer extends React.Component {
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

  componentWillUnmount() {
  }

  onPageComplete = page => {
    const { reviewer, pdf, dispatch }  = this.props
    dispatch(reviewActions.reviewReviewerUpdateRequest({
      reviewer: {
        id: reviewer.id,
        action: `Show the ${pdf.page} page on ${reviewer.file.name}`
      }
    }))
  }

  onSelectFile = filename => {
    const { dispatch } = this.props
    dispatch(reviewActions.reviewFileRequest({
      filename: filename
    }))
  }

  onPostComment = (filename, page, x, y, scale) => {
    const { reviewer, dispatch } = this.props

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
    }))
  }

  onUpdateComment = (id, description) => {
    const { dispatch } = this.props

    dispatch(reviewActions.reviewCommentUpdateRequest({
      id: id,
      changes: {
        description: description
      }
    }))
  }

  onMoveComment = ({id, x, y}) => {
    const { dispatch } = this.props

    dispatch(reviewActions.reviewCommentUpdateRequest({
      id: id,
      changes: {
        x: x,
        y: y
      }
    }))
  }

  onDeleteComment = (id) => {
    const { dispatch } = this.props

    dispatch(reviewActions.reviewCommentRemoveRequest({
      id: id
    }))
  }

  renderJoinForm = ({ handleSubmit, pristine, invalid }) => {
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

  render() {
    const { review, reviewer, pdf, dispatch } = this.props
    const documentView = (isArrayBuffer(reviewer.file && reviewer.file.blob)) ? (
      <PdfContainer {...pdf}
                    review={{
                      ...review,
                      onMoveComment: this.onMoveComment,
                      onUpdateComment: this.onUpdateComment,
                      onDeleteComment: this.onDeleteComment,
                    }}
                    reviewer={reviewer}
                    filename={reviewer.file.name}
                    binaryContent={reviewer.file.blob}
                    onPageComplete={this.onPageComplete}
                    onPageClick={this.onPostComment}
        />
    ) : null
    const reviewerModalView = (reviewer && reviewer.reviewId !== reviewer.reviewId) ? (
      <Modal modalIsOpen={true}>
        <div className="header">{reviewer ? reviewer.reviewId : null}</div>
        <div className="content">
          <Form
            initialValues={{}}
            onSubmit={(values) => dispatch(reviewActions.reviewJoinRequest({
              reviewId: values.review_id,
              reviewer: {
                id: uuidv4(),
                name: values.reviewer_name
              }
            }))}
            render={this.renderJoinForm}/>
        </div>
      </Modal>
    ) : null

    return (
      <div className="ui segment">
        <h2 className="ui header">
          <i className="comment alternate outline icon"></i>
          <div className="content">
            Review
          </div>
        </h2>
        <Loading connected={reviewer.connected}/>
        <Review {...review}
                onSelectFile={this.onSelectFile}/>
        {documentView}
        {reviewerModalView}
      </div>
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
  dispatch => { return { dispatch }}
)
export default connector(ReviewerContainer)
