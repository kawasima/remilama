import React from 'react'
import { Form, Field } from 'react-final-form'
import SelectReviewFile from './SelectReviewFile'

const reviewFile = ({file, onRemoveFile}) => {
  return (
    <li key={file.name}>
      {file.name}
      <button type="button"
              style={{backgroundColor: 'transparent'}}
              className="ui circular icon button"
              onClick={(e) => onRemoveFile(file.name)}>
        <i className="red times icon"></i>
      </button>
    </li>
  )
}

const renderForm = ({files, onSelectFile, onRemoveFile}) => {
  return ({ handleSubmit, pristine, invalid }) => (
    <form className="ui form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Review name</label>
        <Field component="input" name="review_name" />
      </div>

      <div className="field">
        <label>Review files</label>
        { files ? (<ul>{files.map(file => reviewFile({file, onRemoveFile}))}</ul>) : null }
        <SelectReviewFile onSelectFile={onSelectFile} />
      </div>

      <button type="submit"
              className="ui primary button"
              disabled={pristine || invalid}>Create</button>
    </form>
  )
}

export default ({files, onSelectFile, onCreateReview, onRemoveFile }) => {
  return (
    <div>
      <Form
        onSubmit={onCreateReview}
        render={renderForm({files, onSelectFile, onRemoveFile})} />
    </div>
  )
}
