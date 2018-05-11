/* global module */
import React from 'react'
import { storiesOf } from '@storybook/react'

import ReviewCreateNavigation from './'

storiesOf('Organisms|ReviewCreateNavigation', module)
  .add('default', () => (
    <ReviewCreateNavigation/>
  ))
