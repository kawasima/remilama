import React from 'react'
import { Field } from 'react-final-form'
import { mustBePDF } from '../validators'

export default ({onSelectFile}) => (
  <input name="file" type="file" value="" onChange={
           e => {
             const file = e.target.files[0]
             if (!file.name.match(/\.pdf$/)) {
               window.alert('Must be PDF')
             } else {
               onSelectFile(file)
             }
           }
         }/>
)
