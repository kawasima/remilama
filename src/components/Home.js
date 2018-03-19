import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'
import { required, composeValidators, mustBeUUID } from '../validators'

const renderJoinForm = ({ handleSubmit, pristine, invalid }) => (
  <form className="ui form" onSubmit={handleSubmit}>
    <div className="fields">
      <Field component="input" name="review_id"
             validate={composeValidators(required, mustBeUUID)}>
        {({ input, meta }) => (
          <div className="required field">
            <label>Review ID</label>
            <input type="text" {...input} placeholder="Review ID" />
            {meta.error && <span>{meta.error}</span>}
          </div>
        )}
      </Field>
      <div className="required field">
        <label>Reviewer Name</label>
        <Field component="input" name="reviewer_name" placeholder="Your name"
               validate={required}/>
      </div>
      <div className="field">
        <label>&nbsp;</label>
        <button type="submit"
                className="ui primary button"
                disabled={pristine || invalid}>Join</button>
      </div>
    </div>
  </form>
)

export default ({onJoinReview}) => (
  <div>
    <h2 className="ui header">
      <i className="plug icon"></i>
      <div className="content">
        Remilama
      </div>
    </h2>

    <div className="ui grid container">
      <div className="eight wide column">
        <div className="ui raised segment">
          <div className="ui header">Reviewer</div>
          <div className="description">
            Create a review
            <div>
              <Link className="ui primary button" to="/review/new">Create</Link>
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

    <h4 className="ui horizontal divider header">
      <i className="bell outline icon"></i>
      For Development
    </h4>
    <Link to='/pdf'>PDF</Link>
  </div>
)
