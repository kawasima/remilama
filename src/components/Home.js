import React from 'react'
import { Form, Field } from 'react-final-form'
import { required, composeValidators, mustBeUUID } from '../validators'

const reviewIdField = ({ input, meta }) => (
  <div className={'required field' + ((meta.touched && meta.error) ? ' error' : '')}>
    <label>Review ID</label>
    <input type="text" {...input} placeholder="Review ID" />
    <span className={'ui basic red pointing prompt label transition'
          + ((meta.touched && meta.error) ? ' visible' : ' hidden')}>
      {meta.error}&nbsp;
    </span>
  </div>
)

const reviewerNameField = ({ input, meta }) => (
  <div className={'required field' + ((meta.touched && meta.error) ? ' error' : '')}>
    <label>Reviewer Name</label>
    <input type="text" {...input} placeholder="Your name" />
    <span className={'ui basic red pointing prompt label transition'
          + ((meta.touched && meta.error) ? ' visible' : ' hidden')}>
      {meta.error}&nbsp;
    </span>
  </div>
)

const renderJoinForm = ({ handleSubmit, pristine, invalid }) => (
  <form className="ui form" onSubmit={handleSubmit}>
    <div className="fields">
      <Field component="input" name="review_id"
             validate={composeValidators(required, mustBeUUID)}>
        {reviewIdField}
      </Field>
      <Field component="input" name="reviewer_name"
             validate={required}>
        {reviewerNameField}
      </Field>
      <div className="field">
        <label>&nbsp;</label>
        <button type="submit"
                className="ui primary button"
                disabled={pristine || invalid}>Join</button>
      </div>
    </div>
  </form>
)

export default ({onNewReview, onJoinReview}) => (
  <div className="ui stackable grid container">
    <div className="sixteen wide column">
      <div className="ui segment">
        <h2 className="ui header">
          <i className="comment icon"></i>
          <div className="content">
            Remilama
          </div>
        </h2>
        <div className="content">
          <p>
            Remilama is a realtime review tool.
          </p>
        </div>
      </div>
    </div>

    <div className="eight wide column">
      <div className="ui raised segment">
        <div className="ui header">Reviewer</div>
        <div className="description">
          Create a review
          <div>
            <a className="ui primary button" onClick={onNewReview}>Create</a>
          </div>
        </div>
      </div>
    </div>
    <div className="eight wide column">
      <div className="ui raised segment">
        <div className="ui header">Reviewee</div>
        <div className="description">
          <Form
            onSubmit={onJoinReview}
            render={renderJoinForm}/>
        </div>
      </div>
    </div>
  </div>
)
