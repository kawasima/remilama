import React from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import ReviewComment from './'


const DragDropDecorator = (storyFn) => {
  const WrappedComponent = DragDropContext(HTML5Backend)(storyFn)
  return (<WrappedComponent/>)
}

const Wrapper = styled.div`
  position: relative;
  width: 600px;
  height: 400px;
`
storiesOf('Molecules|ReviewComment', module)
  .addDecorator(DragDropDecorator)
  .add('default', () => (
    <Wrapper>
      <ReviewComment description="Some comments"/>
    </Wrapper>
  ))
