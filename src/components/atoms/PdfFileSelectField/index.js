/* global window */
import React from 'react'

const PdfFileSelectField = (props) => (
  <input name="file" type="file" value=""
         accept=".pdf, application/pdf"
         onChange={
           e => {
             const file = e.target.files.item(0)
             if (!file.name.match(/\.pdf$/i)) {
               window.alert('Must be PDF')
             } else {
               props.onSelectFile(file)
             }
           }
         }/>
)

export default PdfFileSelectField
