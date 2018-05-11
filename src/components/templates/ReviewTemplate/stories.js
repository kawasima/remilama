import React from 'react'
import { storiesOf } from '@storybook/react'
import { action, configureActions } from '@storybook/addon-actions'

import ReviewTemplate from './'

const review = {
  reviewers: [],
  comments: []
}

const reviewer = {
}

storiesOf('Templates|ReviewTemplate', module)
  .add('default', () => (
    <ReviewTemplate review={review}
                    reviewer={reviewer}/>
  ))
