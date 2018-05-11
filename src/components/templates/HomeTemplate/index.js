import React from 'react'
import PropTypes from 'prop-types'
import ReviewCreateNavigation from '../../organisms/ReviewCreateNavigation'
import ReviewJoinNavigation from '../../organisms/ReviewJoinNavigation'

const HomeTemplate = (props) => (
  <div className="ui stackable grid container">
    <div className="sixteen wide column">
      <div className="ui segment">
        <h2 className="ui header">
          <i className="comment icon"></i>
          <div className="content">
            Remilama
          </div>
        </h2>
        <div className="content">
          <p>
            Remilama is a realtime review tool.
          </p>
        </div>
      </div>
    </div>

    <div className="eight wide column">
      <ReviewCreateNavigation {...props}/>
    </div>
    <div className="eight wide column">
      <ReviewJoinNavigation {...props}/>
    </div>
  </div>
)

export default HomeTemplate
