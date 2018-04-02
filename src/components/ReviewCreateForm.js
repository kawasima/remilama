import React from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import SelectReviewFile from './SelectReviewFile'
import CustomCommentField from './CustomCommentField'
import { required } from '../validators'
import uuidv4 from 'uuid/v4'

const reviewFile = ({file, onRemoveFile}) => {
  return (
    <li key={uuidv4()}>
      {file.name}
      <button type="button"
              style={{backgroundColor: 'transparent'}}
              className="ui circular icon button"
              onClick={() => onRemoveFile(file.name)}>
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

class AdvancedSettings extends React.Component {
  state = {
    openAdvanced: false
  }

  onToggleAdvanced() {
    this.setState({ openAdvanced: !this.state.openAdvanced })
  }

  render() {
    const { onUploadCustomFields } = this.props
    const advancedTitleClass = this.state.openAdvanced ? 'title active' : 'title'
    const advancedContentClass = this.state.openAdvanced ? 'content active': 'content'

    return (
      <div className="ui accordion">
        <div className={advancedTitleClass} onClick={() => this.onToggleAdvanced()}>
          <i className="dropdown icon"></i>Advanced
        </div>
          <div className={advancedContentClass}>
            <div className="field">
              <label>Custom Fields</label>
              <CustomCommentField onUploadCustomFields={onUploadCustomFields} />
            </div>
          </div>
      </div>
    )
  }
}
const renderForm = ({files, onSelectFile, onRemoveFile, onUploadCustomFields}) => {
  const fileList = files ? (<ul>{files.map(file => reviewFile({file, onRemoveFile}))}</ul>) : null
  return ({ handleSubmit, pristine, invalid }) => (
    <form className="ui form" onSubmit={handleSubmit}>
      <span>{invalid}</span>
      <Field component="input" name="review_name"
             validate={required}>
        {reviewNameField}
      </Field>

      <div className="required field">
        <label>Review files</label>
        { fileList }
        <SelectReviewFile onSelectFile={onSelectFile}/>
      </div>

      <AdvancedSettings onUploadCustomFields={onUploadCustomFields}/>
      <button type="submit"
              className="ui primary button"
              disabled={pristine || invalid || files.length==0}>Create</button>
    </form>
  )
}

class ReviewCreateForm extends React.Component {
  static propTypes = {
    files: PropTypes.array,
    onSelectFile: PropTypes.func.isRequired,
    onCreateReview: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
    onUploadCustomFields: PropTypes.func.isRequired,
  }

  render() {
    const { files, onSelectFile, onCreateReview, onRemoveFile, onUploadCustomFields } = this.props
    return (
    <div>
      <Form
        onSubmit={onCreateReview}
        render={renderForm({files, onSelectFile, onRemoveFile, onUploadCustomFields})
        }
        />
    </div>
    )
  }
}

export default ReviewCreateForm
