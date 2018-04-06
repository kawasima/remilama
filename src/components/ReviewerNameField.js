import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'react-final-form'
import { required, composeValidators, mustBeUUID } from '../validators'

const reviewerNameInput = ({ input, meta }) => (
  <div className={'required field' + ((meta.touched && meta.error) ? ' error' : '')}>
     <label>Reviewer Name</label>
     <input type="text" {...input} placeholder="Your name" />
     <span className={'ui basic red pointing prompt label transition'
           + ((meta.touched && meta.error) ? ' visible' : ' hidden')}>
      {meta.error}&nbsp;
    </span>
  </div>
)

const ReviewerNameField = () => (
  <Field component="input" name="reviewer_name"
         validate={required}>
    {reviewerNameInput}
  </Field>
)

ReviewerNameField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any
  }),
  meta: PropTypes.shape({
    error: PropTypes.any,
    touched: PropTypes.bool
  })
}

export default ReviewerNameField