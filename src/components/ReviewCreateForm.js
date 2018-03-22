import React from 'react'
import { Form, FormSpy, Field } from 'react-final-form'
import SelectReviewFile from './SelectReviewFile'
import { required, composeValidators } from '../validators'

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

const reviewNameField = ({ input, meta }) => (
  <div className={'required field' + ((meta.touched && meta.error) ? ' error' : '')}>
    <label>Review name</label>
    <input type="text" {...input} placeholder="Review name" />
    <span className={'ui basic red pointing prompt label transition'
          + ((meta.touched && meta.error) ? ' visible' : ' hidden')}>
      {meta.error}
    </span>
  </div>
)

const renderForm = ({files, onSelectFile, onRemoveFile}) => {
  return ({ handleSubmit, pristine, invalid }) => (
    <form className="ui form" onSubmit={handleSubmit}>
      <span>{invalid}</span>
      <Field component="input" name="review_name"
             validate={required}>
        {reviewNameField}
      </Field>

      <div className="required field">
        <label>Review files</label>
        { files ? (<ul>{files.map(file => reviewFile({file, onRemoveFile}))}</ul>) : null }
      <SelectReviewFile onSelectFile={onSelectFile}/>
      </div>

      <button type="submit"
              className="ui primary button"
              disabled={pristine || invalid || files.length==0}>Create</button>
      </form>
  )
}

class ReviewCreateForm extends React.Component {
  render() {
    const { files, onSelectFile, onCreateReview, onRemoveFile } = this.props
    return (
    <div>
      <Form
        onSubmit={onCreateReview}
        render={renderForm({files, onSelectFile, onRemoveFile})}/>
    </div>
    )
  }
}

export default ReviewCreateForm
