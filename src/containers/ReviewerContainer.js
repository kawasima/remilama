import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Review from '../components/Review'
import SelectReviewFile from '../components/SelectReviewFile'
import Peer from 'peerjs'

class ReviewerContainer extends React.Component {
  constructor(props) {
    super(props)
    this.peer = new Peer({
      host: 'localhost',
      port: 9000,
      path: '/peerjs',
      // Set highest debug level (log everything!).
      debug: 3,
    })

    const conn = this.peer.connect(props.id)
    conn.on('open', () => conn.send('Hello'))
    conn.on('data', message => {
      switch(message.type) {
      case 'REVIEW_INFO':
        props.onConnectReview(message.name, message.files)
        message.files.forEach(file => {
          conn.send({
            type: 'FILE_REQUEST',
            filename: file
          })
        })
        break
      case 'FILE_RESPONSE':
        console.log(message.blob)
      }
    })
  }

  render() {
    const props = this.props
    return (
      <div>
        <Review {...props} />
      </div>
    )
  }
}

const connector = connect(
  ({ review }) => review,
  (dispatch, props) => {
    return {
      onConnectReview: (name, files) => {
        dispatch({
          type: 'CREATE_REVIEW',
          id: props.id,
          name: name,
          files: files
        })
      }
    }
  }
)
export default withRouter(connector(ReviewerContainer))
