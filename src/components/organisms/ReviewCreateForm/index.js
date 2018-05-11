import React from 'react'
import PropTypes from 'prop-types'
import uuidv4 from 'uuid/v4'
import { Form, Field } from 'react-final-form'
import ReviewNameField from '../../atoms/ReviewNameField'
import PdfFileSelectField from '../../atoms/PdfFileSelectField'
import CustomCommentDefsUploadField from '../../atoms/CustomCommentDefsUploadField'
import CustomCommentFields from '../../molecules/CustomCommentFields'
import { required } from '../../../validators'

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

class AdvancedSettings extends React.Component {
  state = {
    openAdvanced: false
  }

  onToggleAdvanced() {
    this.setState({ openAdvanced: !this.state.openAdvanced })
  }

  render() {
    const { customFields, onUploadCustomFields } = this.props
    const advancedTitleClass = this.state.openAdvanced ? 'title active' : 'title'
    const advancedContentClass = this.state.openAdvanced ? 'content active': 'content'
    const customCommentFields = (customFields && customFields.length > 0) ?
          <CustomCommentFields customFields={customFields} />
          :
          null

    return (
      <div className="ui accordion">
        <div className={advancedTitleClass} onClick={() => this.onToggleAdvanced()}>
          <i className="dropdown icon"></i>Advanced
        </div>
        <div className={advancedContentClass}>
          <div className="field">
            <label>Custom Fields</label>
            {customCommentFields}
            <div className="ui bottom attached segment">
              <CustomCommentDefsUploadField onUploadCustomFields={onUploadCustomFields} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const renderForm = ({
  customFields, files,
  onSelectFile, onRemoveFile, onUploadCustomFields
}) => {
  const fileList = files ? (<ul>{files.map(file => reviewFile({file, onRemoveFile}))}</ul>) : null
  return ({ handleSubmit, pristine, invalid }) => (
    <form className="ui form" onSubmit={handleSubmit}>
      <span>{invalid}</span>
      <ReviewNameField/>

      <div className="required field">
        <label>Review files</label>
        { fileList }
        <PdfFileSelectField onSelectFile={onSelectFile}/>
      </div>

      <AdvancedSettings onUploadCustomFields={onUploadCustomFields}
                        customFields={customFields} />
      <button type="submit"
              className="ui primary button"
              style={{marginTop: "10px"}}
              disabled={pristine || invalid || (!files || files.length === 0)}>Create</button>
    </form>
  )
}

const ReviewCreateForm = (props) => (
  <Form
    onSubmit={props.onCreateReview}
    render={renderForm(props)}
    />
)

ReviewCreateForm.propTypes = {
  files: PropTypes.array
}

ReviewCreateForm.defaultProps = {
  files: []
}

export default ReviewCreateForm
