import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import isArrayBuffer from 'is-array-buffer'
import Review from '../components/Review'
import PdfContainer from '../containers/PdfContainer'
import Peer from 'peerjs'
import Modal from '../components/Modal'
import { Form, Field } from 'react-final-form'
import ReviewerNameField from '../components/ReviewerNameField'
import { required, composeValidators, mustBeUUID } from '../validators'
import detectPort from '../utils/detectPort'

class ReviewerContainer extends React.Component {
  static propTypes = {
    onConnectReview: PropTypes.func.isRequired,
    review: PropTypes.object.isRequired,
    reviewer: PropTypes.object.isRequired,
    pdf: PropTypes.object,
    onJoinReview: PropTypes.func
  }

  state = {
    peer: null,
    dataConnection: null,
    review_id: null
  }

  componentDidMount() {
    const props = this.props

    this.setState({
      review_id: props.match.params.id
    })

    const peer = new Peer({
      host: '/',
      path: '/peerjs',
      port: detectPort(window.location),
      // Set highest debug level (log everything!).
      debug: 3,
    })
    peer.on('error', err => {
      console.error(err.type)
    })

    const dataConnection = peer.connect(props.reviewer.reviewId)
    dataConnection.on('data', message => {
      switch(message.type) {
      case 'REVIEW_INFO':
        dataConnection.send({
          type: 'REVIEWER',
          reviewer: {
            id: props.reviewer.id,
            name: props.reviewer.name
          }
        })
        props.onConnectReview(message.review)
        break
      case 'FILE_RESPONSE':
        props.onReceiveFile(message.file)
        break
      case 'REVIEW/UPDATE_COMMENTS':
        props.onUpdateComments(message.comments)
        break
      }
    })
    dataConnection.on('error', err => {
      console.error(err)
    })
    this.setState({peer, dataConnection})
  }

  componentWillUnmount() {
    const { peer } = this.state
    if (peer) {
      peer.disconnect()
      peer.destroy()
    }
  }

  onPageComplete = page => {
    const { reviewer, pdf }  = this.props
    const { dataConnection } = this.state

    dataConnection.send({
      type: 'UPDATE_REVIEWER',
      reviewer: {

        id: reviewer.id,
        action: `Show the ${pdf.page} page on ${reviewer.file.name}`
      }
    })
  }

  onSelectFile = filename => {
    const { dataConnection } = this.state
    dataConnection.send({
      type: 'FILE_REQUEST',
      filename: filename
    })
  }

  onPostComment = (filename, page, x, y, scale) => {
    const { reviewer } = this.props
    const { dataConnection } = this.state

    dataConnection.send({
      type: 'REVIEW/ADD_COMMENT',
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
    })
  }

  onUpdateComment = (id, description) => {
    const { dataConnection } = this.state

    dataConnection.send({
      type: 'REVIEW/UPDATE_COMMENT',
      id: id,
      changes: {
        description: description
      }
    })
  }

  onMoveComment = ({id, x, y}) => {
    const { dataConnection } = this.state

    dataConnection.send({
      type: 'REVIEW/UPDATE_COMMENT',
      id: id,
      changes: {
        x: x,
        y: y
      }
    })
  }

  onDeleteComment = (id) => {
    const { dataConnection } = this.state

    dataConnection.send({
      type: 'REVIEW/REMOVE_COMMENT',
      id: id
    })
  }

  renderJoinForm = ({ handleSubmit, pristine, invalid }) => (
    <form className="ui form" onSubmit={handleSubmit}>
      <div className="fields">
        <Field component="input" name="review_id"
               validate={composeValidators(required, mustBeUUID)}
               type="hidden" value={this.state.review_id}>
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

  render() {
    const { review, reviewer, pdf, onJoinReview } = this.props
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
    const reviewerModalView = (this.state.review_id !== reviewer.reviewId) ? (
      <Modal modalIsOpen={true}>
        <div className="header">{this.state.review_id}</div>
        <div className="content">
          <Form
              initialValues={this.state}
              onSubmit={onJoinReview}
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
  (dispatch) => {
    return {
      onConnectReview: (review) => {
        dispatch({
          type: 'REVIEW/CREATE_REVIEW',
          review
        })
      },
      onReceiveFile: (file) => {
        dispatch({
          type: 'REVIEWER/SHOW_FILE',
          file: file
        })
      },
      onUpdateComments: comments => {
        dispatch({
          type: 'REVIEW/UPDATE_COMMENTS',
          comments
        })
      },
      onJoinReview: (values, form, cb) => {
        dispatch({
          type: 'JOIN_REVIEW',
          reviewId: values.review_id,
          reviewer: {
            id: uuidv4(),
            name: values.reviewer_name
          }
        })
        window.location.reload()
      },
    }
  }
)
export default connector(ReviewerContainer)
