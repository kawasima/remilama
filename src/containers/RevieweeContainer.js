import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Peer from 'peerjs'
import uuidv4 from 'uuid/v4'
import Review from '../components/Review'
import Reviewer from '../components/Reviewer'
import ReviewStatus from '../components/ReviewStatus'

class RevieweeContainer extends Component {
  constructor(props) {
    super(props)
    this.peer = null
  }

  createPeer(props) {
    this.peer = new Peer(props.id, {
      host: '/',
      port: 9000,
      path: '/peerjs',
      debug: 3,
    })

    this.peer.on('connection', conn => {
      conn.on('open', (id) => {
        console.log(`Connect peer=${id}`)
        conn.send({
          type: 'REVIEW_INFO',
          review: {
            id: props.id,
            name: props.name,
            files: props.files.map(f => { return {name: f.name} })
          }
        })
      })
      conn.on('data', function(message){
        switch(message.type) {
        case 'REVIEWER':
          props.onAddReviewer(message.reviewer, conn)
          break
        case 'FILE_REQUEST':
          const file = props.files.find(f => f.name === message.filename)
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
          props.onUpdateReviewer(message.reviewer)
          break
        case 'REVIEW/ADD_COMMENT':
        case 'REVIEW/UPDATE_COMMENT':
        case 'REVIEW/MOVE_COMMENT':
        case 'REVIEW/REMOVE_COMMENT':
          props.onCommentAction(message)
          break
        }
      })

      conn.on('close', () => {
        const { reviewers, onRemoveReviewer } = this.props
        reviewers.forEach(reviewer => {
          console.log(reviewer.id+ ':' + reviewer.dataConnection + ':' + (reviewer.dataConnection === conn))
          if (reviewer.dataConnection === conn) {
            onRemoveReviewer(reviewer.id)
          }
        })
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    const { comments, reviewers } = nextProps
    if (!reviewers) return

    reviewers.forEach(reviewer => {
      reviewer.dataConnection.send({
        type: 'REVIEW/UPDATE_COMMENTS',
        comments
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

  render() {
    const props = this.props
    return (
      <div>
        <h2 className="ui header">
          <i className="plug icon"></i>
          <div className="content">
            Review
          </div>
        </h2>
        <Review {...props} />

        { props.reviewers.map( reviewer => <Reviewer reviewer={reviewer} /> ) }
      </div>
    )
  }

  static propTypes = {
    comments: PropTypes.array,
    reviewers: PropTypes.array,
    onRemoveReviewer: PropTypes.func.isRequired
  }
}

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onAddReviewer: (reviewer, dataConnection) => {
        dispatch({
          ...reviewer,
          type: 'REVIEW/ADD_REVIEWER',
          dataConnection
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
      }
    }
  }
)
export default connector(RevieweeContainer)
