import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { withRouter } from 'react-router-dom'
import React from 'react'
import Channel from '../components/Channel'
import { history } from '../store'

function ChannelContainer(props) {
  return (
    <Channel {...props} />
  )
}

const connector = connect(
  ({ channel }) => channel,
  (dispatch) => {
    return {
      onCreateChannel: (values, form, cb) => {
        dispatch({type: 'ADD_CHANNEL', name: values.channel_name})
        dispatch(push('/xxx/' + values.channel_name))
      }
    }
  }
)
export default withRouter(connector(ChannelContainer))
