import React, { Component } from 'react'
import { connect } from 'react-redux'
import Peer from 'peerjs'
import uuidv4 from 'uuid/v4'
import Review from '../components/Review'
import ReviewStatus from '../components/ReviewStatus'
import SelectReviewFile from '../components/SelectReviewFile'

class RevieweeContainer extends Component {
  constructor(props) {
    super(props)
    this.peer = null
  }

  createPeer(props) {
    this.peer = new Peer(props.id, {
      host: 'localhost',
      port: 9000,
      path: '/peerjs',
      debug: 3,
    })

    this.peer.on('connection', function(conn) {
      conn.on('open', () => {
        conn.send({
          type: 'REVIEW_INFO',
          name: props.name,
          files: props.files.map(f => f.name)
        })
      })
      conn.on('data', function(message){
        switch(message.type) {
        case 'FILE_REQUEST':
          const file = props.files.find(f => f.name === message.filename)
          const reader = new FileReader()
          reader.onload = () => conn.send({
            type: 'FILE_RESPONSE',
            name: file.name,
            blob: reader.result
          })
          reader.readAsArrayBuffer(file)
        }
      });
    });
  }

  render() {
    const props = this.props
    if (props.isStarted && !this.peer) {
      this.createPeer(props)
    }
    return (
      <div>
        <Review {...props} />
        <SelectReviewFile {...props} />
        <ReviewStatus {...props} />
      </div>
    )
  }
}

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onSelectFile: file => {
        dispatch({
          type: 'ADD_REVIEW_FILE',
          file: file
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
