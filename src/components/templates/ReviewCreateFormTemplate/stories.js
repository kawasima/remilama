/* global module */
import React from 'react'
import { storiesOf } from '@storybook/react'

import ReviewCreateFormTemplate from './'

storiesOf('Templates|ReviewCreateFormTemplate', module)
  .add('default', () => (
    <ReviewCreateFormTemplate/>
  ))
