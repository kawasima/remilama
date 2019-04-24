import React from 'react'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import DocumentControls from './'

storiesOf('Molecules|DocumentControls', module)
  .add('default', () => (
    <DocumentControls page="3"
                      numPages="10"/>
  ))
