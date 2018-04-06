import React from 'react'
import PropTypes from 'prop-types'
import uuidv4 from 'uuid/v4'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import SelectReviewFile from './SelectReviewFile'

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

const Review = ({
  id, name, files, fileObject,
  onReSelectFile, onSelectFile,
  isReviewee
}) => {
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

  return (
    <div className="ui segment">
      <p>Review: {name} ({id})</p>
      <p>Review URL: {location.protocol + '//' + location.host + '/review/' + id + '/reviewer'}
        <CopyToClipboard text={location.protocol + '//' + location.host + '/review/' + id + '/reviewer'}>
          <i className="icon copy" title="copy" style={{cursor: "pointer"}} />
        </CopyToClipboard>
      </p>
      <div>
        {fileList}
      </div>
    </div>
  )
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
