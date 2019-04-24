/* global module */
import React from 'react'
import { storiesOf } from '@storybook/react'

import ReviewJoinNavigation from './'

storiesOf('Organisms|ReviewJoinNavigation', module)
  .add('default', () => (
    <ReviewJoinNavigation/>
  ))
