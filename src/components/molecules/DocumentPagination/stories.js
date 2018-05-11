import React from 'react'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import DocumentPagination from './'

storiesOf('Molecules|DocumentPagination', module)
  .add('default', () => (
    <DocumentPagination page="3"
                        numPages="10"/>
  ))
