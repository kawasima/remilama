import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import PdfFileSelectField from './'

storiesOf('Atoms|PdfFileSelectField', module)
  .add('default', () => (
    <PdfFileSelectField/>
  ))
