import React from 'react'

export default ({onUploadCustomFields}) => (
  <input name="file" type="file" value="" onChange={
           e => {
             const file = e.target.files.item(0)
             if (!file.name.match(/\.json$/)) {
               window.alert('Must be json')
             } else {
               onUploadCustomFields(file)
             }
           }
         }/>
)
