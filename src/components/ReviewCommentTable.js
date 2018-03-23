import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import HotTable from '../components/HotTable'

const idRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  if (value) {
    ReactDOM.render(
      <a href="javascript:void(0)">
        {value.replace(/\-.*$/, '')}
      </a>
        , td)
  }
}

export default ({comments}) => {
  const data = comments.map(comment => Object.assign({}, comment))

  return (
    <div>
      <h3 className="ui top attached header">List of Comments</h3>
      <div className="ui attached segment">
        <HotTable settings={{
                    data,
                    colHeaders: [
                      'ID',
                      'PostedBy',
                      'Description',
                      'Document name',
                      'Page'
                    ],
                    columns: [
                      {
                        data: 'id',
                        renderer: idRenderer
                      },
                      {data: 'postedBy.name'},
                      {data: 'description'},
                      {data: 'filename'},
                      {data: 'page'},
                    ]
                  }}/>
      </div>
    </div>
  )
}
