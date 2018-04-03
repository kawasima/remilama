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

class RevieweeContainer extends Component {
  state = {
    dataConnections: {}
  }
  constructor(props) {
    super(props)
    this.peer = null
  }

  createPeer(props) {
    this.peer = new Peer(props.review.id, {
      host: '/',
      port: 9000,
      path: '/peerjs',
      debug: 3,
    })

    this.peer.on('connection', conn => {
      const { review, fileObject } = this.props
      conn.on('open', (id) => {
        console.log(`Connect peer=${id}`)
        conn.send({
          type: 'REVIEW_INFO',
          review: {
            id: review.id,
            name: review.name,
            files: review.files.map(f => { return {name: f.name} })
          }
        })
      })
      conn.on('data', message => {
        const {
          review,
          onAddReviewer,
          onUpdateReviewer,
          onCommentAction
        } = this.props
        switch(message.type) {
        case 'REVIEWER':
          this.setState({ dataConnections:
                          {...this.state.dataConnections,
                           [message.reviewer.id]: conn}
                        })
          const reviewer = review.reviewers.find(reviewer => reviewer.name === message.reviewer.name)
          if (reviewer) {

          } else {
            onAddReviewer(message.reviewer)
          }
          break
        case 'FILE_REQUEST':
          const file = fileObject.find(f => f.name === message.filename)
          const reader = new FileReader()
          reader.onload = () => conn.send({
            type: 'FILE_RESPONSE',
            file: {
              name: file.name,
              blob: reader.result
            }
          })
          reader.readAsArrayBuffer(file)
          break
        case 'UPDATE_REVIEWER':
          onUpdateReviewer(message.reviewer)
          break
        case 'REVIEW/ADD_COMMENT':
        case 'REVIEW/UPDATE_COMMENT':
        case 'REVIEW/MOVE_COMMENT':
        case 'REVIEW/REMOVE_COMMENT':
          onCommentAction(message)
          break
        }
      })

      conn.on('close', () => {
        const { review, onRemoveReviewer } = this.props
        const { dataConnections } = this.state
        review.reviewers.forEach(reviewer => {
          if (dataConnections[reviewer.id] === conn) {
            onRemoveReviewer(reviewer.id)
          }
        })
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    const review = nextProps.review
    const { dataConnections } = this.state

    if (!review.reviewers) return

    review.reviewers.forEach(reviewer => {
      const dataConnection = dataConnections[reviewer.id]
      if (dataConnection) {
        dataConnection.send({
          type: 'REVIEW/UPDATE_COMMENTS',
          comments: review.comments
        })
      }
    })
  }

  componentDidMount() {
    if (!this.peer) {
      this.createPeer(this.props)
    }
  }

  componentWillUnmount() {
    if (this.peer) {
      this.peer.destroy()
    }
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
    onRemoveReviewer: PropTypes.func.isRequired,
    onChangeCustomValue: PropTypes.func.isRequired
  }
}

const connector = connect(
  ({ review, reviewer, pdf, fileObject }) => {
    return { review, reviewer, pdf, fileObject }
  },
  (dispatch, props) => {
    return {
      onAddReviewer: (reviewer) => {
        dispatch({
          ...reviewer,
          type: 'REVIEW/ADD_REVIEWER'
        })
      },
      onRemoveReviewer: (reviewerId) => {
        dispatch({
          type: 'REVIEW/REMOVE_REVIEWER',
          reviewerId
        })
      },
      onUpdateReviewer: reviewer => {
        dispatch({
          type: 'UPDATE_REVIEWER',
          reviewer: reviewer
        })
      },
      onChangeReviewStatus: () => {
        dispatch({
          type: props.isStarted ? 'END_REVIEW' : 'START_REVIEW'
        })
      },
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
      dispatch
    }
  }
)
export default connector(RevieweeContainer)
