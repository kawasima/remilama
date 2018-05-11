import {
  take,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import Peer from 'peerjs'

import reviewActions from '../actions/review-actions'
import revieweeActions from '../actions/reviewee-actions'

function* broadcastToPeers(action) {
  const { peers, comments, reviewers } = yield select(s => {
    return {
      peers: s.reviewee.peers,
      comments: s.review.comments,
      reviewers: s.review.reviewers
    }
  })
  reviewers.forEach(reviewer => {
    const conn = peers[reviewer.id]
    if (conn) {
      conn.send(
        reviewActions.reviewCommentsPropagated({ comments }))
    }
  })
}

/**
 * Handle the messages from reviewers.
 */
function* handleMessage(action) {
  const { review, fileObject } = yield select(({ review, fileObject }) => {
    return { review, fileObject}
  })
  switch(action.type) {
  case `${reviewActions.reviewInfoResponse}`:
    action.payload.connection.send(reviewActions.reviewInfoResponse({
      review: {
        id: review.id,
        name: review.name,
        comments: review.comments,
        files: review.files.map(f => { return {name: f.name} })
      }
    }))
    break

  case `${reviewActions.reviewReviewerAddRequest}`:
    yield put(revieweeActions.peerConnectionAdded({
      reviewer: action.payload.reviewer,
      connection: action.payload.connection
    }))
    const reviewer = review.reviewers.find(
      reviewer => reviewer.name === action.payload.reviewer.name)
    if (reviewer) {

    } else {
      yield put(reviewActions.reviewReviewerAdded(action.payload.reviewer))
    }
    break

  case `${reviewActions.reviewReviewerRemoveRequest}`:
    const reviewerId = yield select(s => {
      return Object
        .keys(s.reviewee.peers)
        .find(k => action.payload.connection === s.reviewee.peers[k])
    })
    yield put(revieweeActions.peerConnectionRemoved({
      connection: action.payload.connection
    }))
    yield put(reviewActions.reviewReviewerRemoved({ reviewerId }))
    break

  case `${reviewActions.reviewFileRequest}`:
    const file = fileObject.find(f => f.name === action.payload.filename)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => action.payload.connection.send(reviewActions.reviewFileResponse({
        file: {
          name: file.name,
          blob: reader.result
        }
      }))
      reader.readAsArrayBuffer(file)
    } else {
      action.payload.connection.send(reviewActions.reviewFileResponse(
        new Error('Can\'t read file')
      ))
    }
    break

  case `${reviewActions.reviewReviewerUpdateRequest}`:
    yield put(reviewActions.reviewReviewerUpdated({...action.payload}))
    break

  case `${reviewActions.reviewReviewerAddRequest}`:
    yield put(reviewActions.reviewCommentAdded({...action.payload}))
    break

  case `${reviewActions.reviewCommentUpdateRequest}`:
    yield put(reviewActions.reviewCommentUpdated({...action.payload}))
    break

  case `${reviewActions.reviewCommentMoveRequest}`:
    yield put(reviewActions.reviewCommentMoved({...action.payload}))
    break

  case `${reviewActions.reviewCommentRemoveRequest}`:
    yield put(reviewActions.reviewCommentRemoved({...action.payload}))
    break
  }
}

function* reviewee({reviewId, port}) {
  const peer = new Peer(reviewId, {
    host: '/',
    port,
    path: '/peerjs',
    debug: 3,
  })
  const peerChannel = eventChannel(emit => {
    peer.on('connection', conn => {
      conn.on('open', (id) => {
        console.log(`Connect peer=${id}`)
        emit(reviewActions.reviewInfoResponse({
          connection: conn
        }))
      })
      conn.on('data', message => {
        emit({...message, payload: {...message.payload,  connection: conn}})
      })

      conn.on('close', () => {
        emit(reviewActions.reviewReviewerRemoveRequest({
          connection: conn
        }))
      })
    })

    return () => {}
  })
  yield takeEvery(peerChannel, handleMessage)
  yield takeEvery('BROADCAST_TO_PEERS', broadcastToPeers)
}

export function *revieweeSaga() {
  while(true) {
    const action = yield take('START_REVIEWEE')
    yield* reviewee({...action.payload})
  }
}
