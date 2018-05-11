import React from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import { required, composeValidators, mustBeUUID } from '../../../validators'

const render = ({ input, meta }) => (
  <div className={'required field' + ((meta.touched && meta.error) ? ' error' : '')}>
    <label>Review ID</label>
    <input type="text" {...input} placeholder="Review ID" />
    <span className={'ui basic red pointing prompt label transition'
          + ((meta.touched && meta.error) ? ' visible' : ' hidden')}>
      {meta.error}&nbsp;
    </span>
  </div>
)

const ReviewIdField = () => (
  <Field component="input" name="review_id"
         validate={composeValidators(required, mustBeUUID)}>
    {render}
  </Field>
)

ReviewIdField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any
  }),
  meta: PropTypes.shape({
    error: PropTypes.any,
    touched: PropTypes.bool
  })
}

export default ReviewIdField
