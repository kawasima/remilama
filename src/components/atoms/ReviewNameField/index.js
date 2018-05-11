import React from 'react'
import classNames from 'classnames'
import { Field } from 'react-final-form'
import { required } from '../../../validators'

const render = ({ input, meta }) => (
  <div className={classNames('required', 'field', { error: meta.touched && meta.error })}>
    <label>Review name</label>
    <input type="text" {...input} placeholder="Review name" />
    <span className={classNames(
            'ui basic red pointing prompt label transition',
          (meta.touched && meta.error) ? 'visible' : 'hidden')}>
      {meta.error}
    </span>
  </div>
)

const ReviewNameField = () => (
  <Field component="input"
         type="text"
         name="review_name"
         validate={required}>
    {render}
  </Field>

)

export default ReviewNameField
