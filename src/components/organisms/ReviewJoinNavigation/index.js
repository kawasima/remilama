import React from 'react'
import { Form, Field } from 'react-final-form'
import { required, composeValidators, mustBeUUID } from '../../../validators'
import ReviewIdField from '../../atoms/ReviewIdField'
import ReviewerNameField from '../../atoms/ReviewerNameField'


const renderJoinForm = ({ handleSubmit, pristine, invalid }) => (
  <form className="ui form" onSubmit={handleSubmit}>
    <div className="fields">
      <ReviewIdField />
      <ReviewerNameField />

      <div className="field">
        <label>&nbsp;</label>
        <button type="submit"
                className="ui primary button"
                disabled={pristine || invalid}>Join</button>
      </div>
    </div>
  </form>
)

const ReviewJoinNavigation = ({ onJoinReview }) => (
  <div className="ui raised segment">
    <div className="ui header">Reviewer</div>
    <div className="description">
      <Form
        onSubmit={onJoinReview}
        render={renderJoinForm}/>
    </div>
  </div>
)

export default ReviewJoinNavigation
