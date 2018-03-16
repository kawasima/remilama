import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'

const renderJoinForm = ({ handleSubmit, pristine, invalid }) => (
  <form className="ui form" onSubmit={handleSubmit}>
    <div className="fields">
      <div className="field">
        <label>Review ID</label>
        <Field component="input" name="review_id" placeholder="Review ID" />
      </div>
      <div className="field">
        <label>Reviewer Name</label>
        <Field component="input" name="reviewer_name" placeholder="Your name"/>
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

    <div className="ui relaxed divided list">
      <div className="item">
        <div className="content">
          <Link className="header" to="/review/new">Reviewer</Link>
          <div className="description">Create a review</div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Reviewee</div>
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
