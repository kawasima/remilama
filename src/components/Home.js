import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'

export default ({onJoinReview}) => (
  <div>
    <h2>Menu</h2>

    <div>
      <Link to='/review/new'>Create Review</Link>
    </div>

    <div>
      <Form
        onSubmit={onJoinReview}
        render={({ handleSubmit, pristine, invalid }) => (
          <form onSubmit={handleSubmit}>
            <Field component="input" name="review_id" />
            <button type="submit" disabled={pristine || invalid}>Join</button>
          </form>
        )}/>
    </div>
    <hr/>
    <Link to='/pdf'>PDF</Link>
  </div>
)
