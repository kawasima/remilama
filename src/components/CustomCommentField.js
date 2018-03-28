import React from 'react'

const renderId = (
  <Field name="customCommentFieldId">
    {({ input, meta }) => (
      <div>
        <label>ID</label>
        <input type="text" {...input} placeholder="ID" />
        {meta.touched && meta.error && <span>{meta.error}</span>}
      </div>
    )}
  </Field>
)

const renderLabel = (
  <Field name="customCommentFieldLabel">
    {({ input, meta }) => (
      <div>
        <label>Label</label>
        <input type="text" {...input} placeholder="Label" />
        {meta.touched && meta.error && <span>{meta.error}</span>}
      </div>
    )}
  </Field>
)

const renderType = (
  <Field name="customCommentFieldType" component="select">
    <option />
    <option value="text">Text</option>
    <option value="pulldown">Pulldown</option>
  </Field>
)


const renderOptions = ({ input, meta }) => (
  <div>
    <label>Options</label>
    <textarea {...input} />
    {meta.touched && meta.error && <span>{meta.error}</span>}
  </div>
)
export default ({id, label, type, options}) => {
  return (
    <div>
      {renderId}
      {renderLabel}
      {renderType}
    </div>
  )
}
