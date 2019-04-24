import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'
import styled from 'styled-components'

import ReviewIdField from './'

const Wrapper = styled.div`
  width: 300px;
`

storiesOf('Atoms|ReviewIdField', module)
  .add('default', () => (
    <Wrapper>
      <form className="ui form">
        <ReviewIdField/>
      </form>
    </Wrapper>
  ))
