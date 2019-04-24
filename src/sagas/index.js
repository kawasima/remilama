import { fork } from 'redux-saga/effects'
import { reviewerSaga } from './reviewer-saga'
import { revieweeSaga } from './reviewee-saga'

export default function* rootSaga() {
  yield fork(reviewerSaga)
  yield fork(revieweeSaga)
}
