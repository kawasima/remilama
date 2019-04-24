import React from 'react'
import styled from 'styled-components'

const NavButton = styled.div`
  cursor: pointer;
`


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
      <NavButton className="item" onClick={
             e => {
               e.preventDefault()
               onPrevious(page)
             }
        }>
        <i className="chevron left icon"></i>
      </NavButton>)

    if (page === 1) {
      previousButton = (
        <NavButton className="item disabled">
          <i className="chevron left icon"></i>
        </NavButton>)
    }

    let nextButton = (
      <NavButton className="item" onClick={
             e => {
               e.preventDefault()
               onNext(page)
             }
        }>
        <i className="chevron right icon"></i>
      </NavButton>
    )
    if (page === numPages) {
      nextButton = <NavButton className="item disabled"><i className="chevron right icon"></i></NavButton>
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
                     this.setState({pageInput: e.target.value},
                                   () => {
                                     const intVal = parseInt(e.target.value)
                                     if (!isNaN(intVal) && intVal > 0 && intVal <= numPages) {
                                                                                     onGoToPage(intVal)
                                                                                     }
                                                                                     })

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
