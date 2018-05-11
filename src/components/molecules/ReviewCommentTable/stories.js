import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'
import uuidv4 from 'uuid/v4'

import ReviewCommentTable from './'

storiesOf('Molecules|ReviewCommentTable', module)
  .add('default', () => (
    <ReviewCommentTable/>
  ))
  .add('with custom fields', () => (
    <ReviewCommentTable
      customFields={[{
        id: 'cause',
        label: 'cause',
        type: 'dropdown',
        source: ['careless']
      }]}
      comments={[
        {
          id: uuidv4(),
          postedBy: { name: 'kawasima'},
          description: 'description',
          filename: 'filename',
          page: 3
        }
      ]}/>
  ))
