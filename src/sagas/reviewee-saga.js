import {
  race,
  take,
  put,
  fork,
  select,
  cancel,
  takeLatest,
  takeEvery,
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import Peer from 'peerjs'

import reviewActions from '../actions/review-actions'
import reviewerActions from '../actions/reviewer-actions'
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
  case 'REVIEW_INFO_RESPONSE':
    action.payload.connection.send(reviewActions.reviewInfoResponse({
      review: {
        id: review.id,
        name: review.name,
        comments: review.comments,
        files: review.files.map(f => { return {name: f.name} })
      }
    }))
    break
  case 'REVIEW_REVIEWER_ADD_REQUEST':
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
  case 'REVIEW_REVIEWER_REMOVE_REQUEST':
    yield put(revieweeActions.peerConnectionRemoved({
    }))
    yield put(reviewActions.reviewReviewerRemoved())
    break
  case 'REVIEW_FILE_REQUEST':
    const file = fileObject.find(f => f.name === action.payload.filename)
    const reader = new FileReader()
    reader.onload = () => action.payload.connection.send(reviewActions.reviewFileResponse({
      file: {
        name: file.name,
        blob: reader.result
      }
    }))
    reader.readAsArrayBuffer(file)
    break
  case 'REVIEW_REVIEWER_UPDATE_REQUEST':
    yield put(reviewActions.reviewReviewerUpdated({...action.payload}))
    break
  case 'REVIEW_COMMENT_ADD_REQUEST':
    yield put(reviewActions.reviewCommentAdded({...action.payload}))
    break
  case 'REVIEW_COMMENT_UPDATE_REQUEST':
    yield put(reviewActions.reviewCommentUpdated({...action.payload}))
    break
  case 'REVIEW_COMMENT_MOVE_REQUEST':
    yield put(reviewActions.reviewCommentMoved({...action.payload}))
    break
  case 'REVIEW_COMMENT_REMOVE_REQUEST':
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
