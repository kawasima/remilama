import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import ReviewSummary from './'

import uuidv4 from 'uuid/v4'

storiesOf('Organisms|ReviewSummary', module)
  .add('default', () => (
    <ReviewSummary id={uuidv4()}
                   name='Review Sample'/>
  ))
