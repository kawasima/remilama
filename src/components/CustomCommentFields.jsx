import React from 'react'

const CustomField = ({ customField }) => (
  <li className="text-sm">{customField.label}</li>
)

export default function CustomCommentFields({ customFields }) {
  return (
    <div className="rounded-md border border-border p-3">
      <ul className="list-disc list-inside space-y-1">
        {customFields.map(f => <CustomField key={f.id} customField={f} />)}
      </ul>
    </div>
  )
}
