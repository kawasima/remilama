/* globals window */
import React from 'react'
import PropTypes from 'prop-types'

const CustomCommentFieldUpload = ({onUploadCustomFields}) => (
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
CustomCommentFieldUpload.propTypes = {
  onUploadCustomFields: PropTypes.func.isRequired
}

export default CustomCommentFieldUpload
