/* global module */
import React from 'react'
import { storiesOf } from '@storybook/react'

import ReviewDocumentViewer from './'

storiesOf('Organisms|ReviewDocumentViewer', module)
  .add('default', () => (
    <ReviewDocumentViewer/>
  ))
