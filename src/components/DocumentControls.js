import React from 'react'

const renderPagination = (page, pages, onPrevious, onNext) => {
  let previousButton = (
    <div className="item" onClick={e => onPrevious(page)}>
      <i className="chevron left icon"></i>
    </div>)

    if (page === 1) {
      previousButton = (
        <div className="item disabled">
          <i className="chevron left icon"></i>
        </div>)
    }

  let nextButton = (
    <div className="item" onClick={e => onNext(page)}>
      <i className="chevron right icon"></i>
    </div>
  )
  if (page === pages) {
    nextButton = <div className="item disabled"><i className="chevron right icon"></i></div>
  }

  return (
    <div className="ui pagination menu">
      {previousButton}
      <div className="item">{page} / {pages}</div>
      {nextButton}
    </div>
  )
}

export default ({
  page, numPages, scale,
  onPrevious, onNext,
  onZoomOut, onZoomIn
}) => (
  <div className="ui secondary compact menu">
    <div className="item">
      {renderPagination(page, numPages, onPrevious, onNext)}
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
