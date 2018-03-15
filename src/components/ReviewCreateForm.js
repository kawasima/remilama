import React from 'react'
import { Form, Field } from 'react-final-form'

export default ({onCreateReview}) =>
  (
    <div>
      <Form
        onSubmit={onCreateReview}
        render={({ handleSubmit, pristine, invalid }) => (
          <form onSubmit={handleSubmit}>
            <Field component="input" name="review_name" />
            <button type="submit" disabled={pristine || invalid}>Create</button>
          </form>
        )} />
      </div>
  )
