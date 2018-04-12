import {
  race,
  take,
  put,
  fork,
  select,
  cancel,
  takeLatest,
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import Peer from 'peerjs'
import store from '../store'
import reviewActions from '../actions/review-actions'

const dispatch = store.dispatch

function* handleMessage(channel) {
  const action = yield take(channel)
  console.log(action)
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
  const channel = eventChannel(emit => {
    peer.on('error', (err) => {
      emit(reviewActions.reviewConnectFail())
    })
    return () => {}
  })
  yield fork(handleMessage, channel)

  const dataConnection = peer.connect(reviewId)
  dataConnection.on('data', message => {
    switch(message.type) {
    case 'REVIEW_INFO':
      dataConnection.send({
        type: 'REVIEWER',
        reviewer: {
          id: reviewer.id,
          name: reviewer.name
        }
      })
      dispatch(reviewActions.reviewConnected({
        review: message.review
      }))
      break
    case 'FILE_RESPONSE':
      dispatch(reviewActions.reviewResponseFile({
        file: message.file
      }))
      break
    case 'REVIEW_COMMENT_UPDATED':
      dispatch(reviewActions.reviewCommentReceived({
        comments: message.comments
      }))
      break
    }
  })

  dataConnection.on('error', err => {
    console.error(err)
  })

  while(true) {
    const onMessage = yield race({
      reviewerUpdated: take('REVIEWER_UPDATED')
    })

    if (onMessage.reviewerUpdated) {
      console.log('REVIEWER_UPDATEDE')
    }
  }
}

function *main() {
  while(true) {
    console.log('main start')
    const peer = yield race({
      reviewer: take('START_REVIEWER'),
      reviewee: take('START_REVIEWEE')
    })
    console.log('take action')

    if (peer.reviewer) {
      yield* reviewer({...peer.reviewer.payload})
    }
  }
}

export default function* rootSaga() {
  yield fork(main);
}
