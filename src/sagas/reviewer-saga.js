import {
  race,
  take,
  put,
  fork,
  select,
  cancel,
  takeEvery
} from 'redux-saga/effects'
import { eventChannel, delay } from 'redux-saga'
import Peer from 'peerjs'

import reviewActions from '../actions/review-actions'
import reviewerActions from '../actions/reviewer-actions'

function* handleReviewerUpdateRequest(dataConnection, action) {
  dataConnection.send(action)
}

function* peerConnect(peer, reviewId) {
  const dataConnection = peer.connect(reviewId)
  const reviewer = yield select(s => s.reviewer)
  const dataChannel = eventChannel(emit => {
    dataConnection.on('data', action => {
      switch(action.type) {
      case `${reviewActions.reviewInfoResponse}`:
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
      case `${reviewActions.reviewFileResponse}`:
        emit(reviewerActions.reviewerShowFile({
          file: action.payload.file
        }))
        break
      case `${reviewActions.reviewFileErrorResponse}`:
        emit(reviewerActions.reviewerShowFileFail({
          failFile: action.payload.file
        }))
      case `${reviewActions.reviewCommentsPropagated}`:
        emit(action)
        break
      default:
        console.warn(`Unknown action type: ${action.type}`)
      }
    })

    dataConnection.on('close', () => {
      emit(reviewerActions.reviewerDisconnected())
      emit(reviewerActions.reviewerConnectFail())
      emit(reviewerActions.reviewerConnecting({ peer, reviewId }))
    })

    dataConnection.on('error', err => {
      console.log('dataConnection error!')
      console.error(err)
    })

    return () => {}
  })

  const tasks = [
    yield takeEvery(dataChannel, handleMessage),
    yield takeEvery(`${reviewActions.reviewReviewerUpdateRequest}`,
                    handleReviewerUpdateRequest, dataConnection),

    yield takeEvery(`${reviewActions.reviewFileRequest}`,
                    handleReviewerUpdateRequest, dataConnection),

    yield takeEvery(`${reviewActions.reviewCommentAddRequest}`,
                    handleReviewerUpdateRequest, dataConnection),

    yield takeEvery(`${reviewActions.reviewCommentUpdateRequest}`,
                    handleReviewerUpdateRequest, dataConnection),

    yield takeEvery(`${reviewActions.reviewCommentRemoveRequest}`,
                    handleReviewerUpdateRequest, dataConnection)
  ]
  const disconnected = yield take(`${reviewerActions.reviewerDisconnected}`)
  for (let task of tasks) {
    yield cancel(task)
  }
}

function* handleMessage(action) {
  if (action.type === `${reviewerActions.reviewerConnecting}`) {
    yield delay(2000)
    yield peerConnect(action.payload.peer, action.payload.reviewId)
  } else {
    yield put(action)
  }
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
      switch(err.type) {
      case 'peer-unavailable':
      case 'disconnected':
      case 'network':
        emit(reviewerActions.reviewerDisconnected())
        peer.disconnect()
        emit(reviewerActions.reviewerConnecting({ peer, reviewId }))
        break
      default:
        console.log(`fatal error=${err.type}`)
      }
      emit(reviewerActions.reviewerConnectFail())
    })
    return () => {}
  })
  yield takeEvery(peerChannel, handleMessage)
  yield* peerConnect(peer, reviewId)

}

export function *reviewerSaga() {
  console.log('main start')
  while(true) {
    const action = yield take('START_REVIEWER')
    yield* reviewer({...action.payload})
  }
}
