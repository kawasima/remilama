import { createActions } from 'redux-actions'

export default createActions(
  'REVIEWER_JOIN',
  'REVIEWER_CONNECTING',
  'REVIEWER_SHOW_FILE',
  'REVIEWER_SHOW_FILE_FAIL',
  'REVIEWER_CONNECT_FAIL',
  'REVIEWER_CONNECTED',
  'REVIEWER_DISCONNECTED'
)
