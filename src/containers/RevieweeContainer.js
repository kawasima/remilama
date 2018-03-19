import React, { Component } from 'react'
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

    this.peer.on('connection', function(conn) {
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
          props.onAddReviewer(message.reviewer)
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
        }
      });
    });
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
}

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onAddReviewer: (reviewer) => {
        dispatch({
          ...reviewer,
          type: 'ADD_REVIEWER'
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
      }
    }
  }
)
export default connector(RevieweeContainer)
