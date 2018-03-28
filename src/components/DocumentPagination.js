import React from 'react'

export default class DocumentPagination extends React.Component {
  state = {
    pageInput: ''
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ pageInput: nextProps.page})
  }

  render () {
    const {
      page,
      numPages,
      onPrevious,
      onNext,
      onGoToPage
    } = this.props

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
    if (page === numPages) {
      nextButton = <div className="item disabled"><i className="chevron right icon"></i></div>
    }

    return (
      <div className="ui pagination menu">
        {previousButton}
        <div className="item">
          <span>
            <input type="number"
                   style={{
                     textAlign: 'right',
                     width: '40px'
                   }}
                   value={this.state.pageInput}
                   onChange={e => {
                     this.setState({pageInput: e.target.value})
                     const intVal = parseInt(e.target.value)
                     if (!isNaN(intVal) && intVal > 0 && intVal <= numPages) {
                                                                     onGoToPage(intVal)
                                                                     }
                                                                   }}/>
          </span>
          /
          <span>{numPages}</span>
        </div>
        {nextButton}
      </div>
    )
  }
}
