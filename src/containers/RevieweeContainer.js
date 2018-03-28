import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Peer from 'peerjs'
import uuidv4 from 'uuid/v4'
import PdfContainer from '../containers/PdfContainer'
import Review from '../components/Review'
import Reviewer from '../components/Reviewer'
import ReviewStatus from '../components/ReviewStatus'
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
      const { review } = this.props
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
          const file = review.files.find(f => f.name === message.filename)
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

    console.log(dataConnections)
    review.reviewers.forEach(reviewer => {
      dataConnections[reviewer.id].send({
        type: 'REVIEW/UPDATE_COMMENTS',
        comments: review.comments
      })
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
    const { review, dispatch } = this.props
    const file = review.files.find(f => f.name === filename)
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

    const documentView = (props.reviewer.file) ? (
      <PdfContainer {...props.pdf}
                    review={props.review}
                    filename={props.reviewer.file.name}
                    binaryContent={props.reviewer.file.blob}
                    onPageComplete={e => {}}
                    />
    )
          :
          null

    return (
      <div>
        <h2 className="ui header">
          <i className="comment alternate outline icon"></i>
          <div className="content">
            Review
          </div>
        </h2>
        <Review {...props.review}
                onSelectFile={this.onSelectFile}/>

        { props.review.reviewers.map( reviewer => <Reviewer reviewer={reviewer} /> ) }
      {documentView}
        <ReviewCommentTable
      comments={props.review.comments}
        />
      </div>
    )
  }

  static propTypes = {
    reviewer: PropTypes.object,
    review: PropTypes.object,
    pdf: PropTypes.object,
    onRemoveReviewer: PropTypes.func.isRequired
  }
}

const connector = connect(
  ({ review, reviewer, pdf }) => {
    return { review, reviewer, pdf }
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
      dispatch
    }
  }
)
export default connector(RevieweeContainer)
