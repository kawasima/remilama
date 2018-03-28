import React from 'react'
import DocumentPagination from '../components/DocumentPagination'

export default (props) => {
  const {
    onZoomOut, onZoomIn, scale
  } = props

  return (
    <div className="ui secondary compact menu">
      <div className="item">
        <DocumentPagination {...props} />
      </div>
      <div className="item">
        <div className="ui buttons">
          <button className="ui icon button" onClick={(e) => onZoomOut(scale)}>
            <i className="search minus icon"></i>
          </button>
          <button className="ui icon button" onClick={(e) => onZoomIn(scale)}>
            <i className="search plus icon"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
