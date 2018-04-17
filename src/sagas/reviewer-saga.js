import {
  race,
  take,
  put,
  fork,
  select,
  cancel,
  takeLatest,
  takeEvery
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import Peer from 'peerjs'

import reviewActions from '../actions/review-actions'
import reviewerActions from '../actions/reviewer-actions'

function* handleReviewerUpdateRequest(dataConnection, action) {
  dataConnection.send(action)
}

function* handleMessage(action) {
  yield put(action)
}

function* reviewer({reviewId, port}) {
  const peer = new Peer({
    host: '/',
    path: '/peerjs',
    port,
    // Set highest debug level (log everything!).
    debug: 3,
  })
  const peerChannel = eventChannel(emit => {
    peer.on('error', (err) => {
      console.log(err)
      emit(reviewerActions.reviewerConnectFail())
    })
    return () => {}
  })
  yield takeEvery(peerChannel, handleMessage)

  const dataConnection = peer.connect(reviewId)
  const dataChannel = eventChannel(emit => {
    dataConnection.on('data', action => {
      switch(action.type) {
      case 'REVIEW_INFO_RESPONSE':
        dataConnection.send(reviewActions.reviewReviewerAddRequest({
          reviewer: {
            id: reviewer.id,
            name: reviewer.name
          }
        }))
        emit(reviewActions.reviewConnected({
          review: action.payload.review
        }))
        emit(reviewerActions.reviewerConnected())
        break
      case 'REVIEW_FILE_RESPONSE':
        emit(reviewerActions.reviewerShowFile({
          file: action.payload.file
        }))
        break
      case 'REVIEW_COMMENTS_PROPAGATED':
        emit(action)
        break
      }
    })

    dataConnection.on('error', err => {
      console.error(err)
    })

    return () => {}
  })
  yield takeEvery(dataChannel, handleMessage)
  yield takeLatest('REVIEW_REVIEWER_UPDATE_REQUEST', handleReviewerUpdateRequest, dataConnection)
  yield takeLatest('REVIEW_FILE_REQUEST', handleReviewerUpdateRequest, dataConnection)
  yield takeLatest('REVIEW_COMMENT_ADD_REQUEST', handleReviewerUpdateRequest, dataConnection)
  yield takeLatest('REVIEW_COMMENT_UPDATE_REQUEST', handleReviewerUpdateRequest, dataConnection)
  yield takeLatest('REVIEW_COMMENT_REMOVE_REQUEST', handleReviewerUpdateRequest, dataConnection)
}

export function *reviewerSaga() {
  console.log('main start')
  while(true) {
    const action = yield take('START_REVIEWER')
    yield* reviewer({...action.payload})
  }
}
