import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import HomeTemplate from './'

storiesOf('Templates|HomeTemplate', module)
  .add('default', () => (
    <HomeTemplate />
  ))
