/* global module */
import React from 'react'
import { storiesOf } from '@storybook/react'

import HotTable from './'

const data = [
  ["", "Ford", "Volvo", "Toyota", "Honda"],
  ["2016", 10, 11, 12, 13],
  ["2017", 20, 11, 14, 13],
  ["2018", 30, 15, 12, 13]
]

storiesOf('Atoms|HotTable', module)
  .add('default', () => (
    <HotTable data={data}/>
  ))
