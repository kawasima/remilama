/* globals window*/
import React from 'react'
import PropTypes from 'prop-types'
import uuidv4 from 'uuid/v4'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import SelectReviewFile from './SelectReviewFile'

const copiedPopup = () => (
  <div className="ui popup bottom right inverted transition visible"
       style={
         {
           display: "block",
           marginTop: "25px"
         }
       }>
    <div className="content">Copied</div>
  </div>
)

const renderFile = ({file, onReSelectFile, onSelectFile, isReviewee}) => {
  const filelink = (!(file.object) && isReviewee) ?
        (
          <span>
            <span>{file.name}</span>
            <SelectReviewFile onSelectFile={onReSelectFile}/>
          </span>
        )
        :
        (
          <a onClick={() => onSelectFile(file.name)}
            style={{cursor: 'pointer'}}>
            {file.name}
          </a>
        )
  return (
    <li key={uuidv4()}>
      {filelink}
    </li>
  )
}

class Review extends React.Component {
  state = {
    isCopying: false
  }

  onCopy = () => {
    this.setState({isCopying: true})
    window.setTimeout(() => {
      this.setState({isCopying: false})
    }, 2000)
  }

  render() {
      const {
        id, name, files, fileObject,
        onReSelectFile, onSelectFile,
        isReviewee
      } = this.props

    const fileList = (
      <ul>
        {
          files.map(file => {
            file.object = (fileObject || []).find(f => f.name === file.name)
            return renderFile({file, onSelectFile, onReSelectFile, isReviewee})
          })
        }
      </ul>
    )

    const popup = this.state.isCopying ? copiedPopup() : null
    const reviewerUrl = `${window.location.origin}/review/${id}/reviewer`
    return (
      <div className="ui segment">
        <div>
          Review: {name} ({id}
          <CopyToClipboard text={reviewerUrl}
                           onCopy={this.onCopy}>
            <span style={{position: "relative"}}>
              <i className="icon copy" title="copy" style={{cursor: "pointer"}} />
              {popup}
            </span>
          </CopyToClipboard>)
      </div>
        <div>
          {fileList}
        </div>
      </div>
    )
  }
}

Review.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  files: PropTypes.array,
  fileObject: PropTypes.array,
  onSelectFile: PropTypes.func,
  onReSelectFile: PropTypes.func,
  isReviewee: PropTypes.bool
}

export default Review
