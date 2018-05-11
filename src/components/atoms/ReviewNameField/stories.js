import React from 'react'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'
import { Form, Field } from 'react-final-form'


import ReviewNameField from './'

const Wrapper = styled.div`
  width: 300px;
`

storiesOf('Atoms|ReviewNameField', module)
  .add('default', () => (
    <div>
      <Wrapper>
        <Form onSubmit={() => {}}
          render={() => (
            <form className="ui form">
              <ReviewNameField/>
            </form>
          )}/>
      </Wrapper>
    </div>
  ))
