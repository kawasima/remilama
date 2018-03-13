import { connect } from 'react-redux'
import React from 'react'
import Channel from '../components/Channel'

function ChannelContainer(props) {
  return (
    <Channel {...props} />
  )
}

const connector = connect(({ channel }) => channel)
export default connector(ChannelContainer)
