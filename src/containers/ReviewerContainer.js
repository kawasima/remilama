import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Review from '../components/Review'
import SelectReviewFile from '../components/SelectReviewFile'
import PdfContainer from '../containers/PdfContainer'
import Peer from 'peerjs'

class ReviewerContainer extends React.Component {
  static propTypes = {
    onConnectReview: PropTypes.func.isRequired,
    review: PropTypes.object.isRequired,
    reviewer: PropTypes.object.isRequired,
    pdf: PropTypes.object
  }

  state = {}

  componentDidMount() {
    const props = this.props
    const peer = new Peer({
      host: '/',
      port: 9000,
      path: '/peerjs',
      // Set highest debug level (log everything!).
      debug: 3,
    })
    peer.on('error', err => {
      console.error(err.type)
    })



    const conn = peer.connect(props.reviewer.reviewId)
    conn.on('data', message => {
      switch(message.type) {
      case 'REVIEW_INFO':
        conn.send({
          type: 'REVIEWER',
          reviewer: props.reviewer
        })
        props.onConnectReview(message.review)
        break
      case 'FILE_RESPONSE':
        props.onReceiveFile(message.file)
      }
    })
    this.setState({
      dataConnection: conn,
      peer: peer
    })
  }

  componentWillUnmount() {
    this.state.peer.disconnect()
    this.state.peer.destroy()
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

  render() {
    const { review, reviewer, pdf } = this.props
    const documentView = (reviewer.file) ? (
      <PdfContainer {...pdf}
                    binaryContent={reviewer.file.blob}
                    onPageComplete={this.onPageComplete}
        />
    ) : null
    return (
      <div>
        <Review {...review}
                onSelectFile={this.onSelectFile}/>
          {documentView}
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
  (dispatch, { review }) => {
    return {
      onConnectReview: (review) => {
        dispatch({
          type: 'CREATE_REVIEW',
          review
        })
      },
      onReceiveFile: (file) => {
        dispatch({
          type: 'REVIEWER/SHOW_FILE',
          file: file
        })
      }
    }
  }
)
export default withRouter(connector(ReviewerContainer))
