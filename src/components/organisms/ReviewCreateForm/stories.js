import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import ReviewCreateForm from './'

storiesOf('Organisms|ReviewCreateForm', module)
  .add('default', () => (
    <ReviewCreateForm/>
  ))
