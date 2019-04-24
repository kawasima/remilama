import React from 'react'
import PropTypes from 'prop-types'

const CustomField = ({customField}) => (
  <li>{customField.label}</li>
)

CustomField.propTypes = {
  customField: PropTypes.shape({
    label: PropTypes.string.isRequired
  })
}

const CustomCommentFields = ({customFields}) => (
  <div className="ui top attached segment items">
    <ul>
      {customFields.map(f => <CustomField key={f.id} customField={f} />)}
  </ul>
    </div>
)

CustomCommentFields.propTypes = {
  customFields: PropTypes.array
}

export default CustomCommentFields
