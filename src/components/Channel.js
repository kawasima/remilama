import React from 'react'
import { Form, Field } from 'react-final-form'

export default ({channels, onCreateChannel}) =>
  (
    <div>
      <ul>{channels.map(chan => <li>{chan.name}</li>)}</ul>

      <Form
    onSubmit={onCreateChannel}
    render={({ handleSubmit, pristine, invalid }) => (
      <form onSubmit={handleSubmit}>
        <Field component="input" name="channel_name" />
        <button type="submit" disabled={pristine || invalid}>Create</button>
      </form>
    )}
    />
      </div>
  )
