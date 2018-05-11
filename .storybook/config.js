import React from 'react'
import { configure, addDecorator } from '@storybook/react'
import { withInfo, setDefaults } from '@storybook/addon-info'
import { setOptions } from '@storybook/addon-options'

import './style.css'

const req = require.context('../src/', true, /stories\.js$/)
function loadStories() {
  req.keys().forEach(req)
}

setOptions({
  hierarchySeparator: /\/|\./,
  hierarchyRootSeparator: /\|/,
});

setDefaults({
  inline: true,
})

addDecorator((story, context) => withInfo(context.kind)(story)(context))

configure(loadStories, module)
