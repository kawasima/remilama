import React from 'react'

export default ({isStarted, onChangeReviewStatus}) => {
  return (
    <button onClick={onChangeReviewStatus}>
      {isStarted?'Start':'End'}
    </button>
  )
}
