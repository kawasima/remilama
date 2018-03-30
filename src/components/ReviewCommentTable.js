import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import HotTable from '../components/HotTable'

const idRenderer = (instance, td, row, col, prop, value) => {
  if (value) {
    ReactDOM.render(
      <a href="javascript:void(0)">
        {value.replace(/-.*$/, '')}
      </a>
        , td)
  }
}

const defaultColHeaders = [
  'ID',
  'PostedBy',
  'Description',
  'Document name',
  'Page'
]

const defaultColumns = [
  {
    data: 'id',
    renderer: idRenderer,
    readonly: true
  },
  {data: 'postedBy.name', readOnly: true},
  {data: 'description', readOnly: true},
  {data: 'filename', readOnly: true},
  {data: 'page', readOnly: true}
]

export default class ReviewCommentTable extends React.Component {
  state = {
    width: 800
  }

  componentDidMount() {
    const container = this.container
    this.setState({width: container.getBoundingClientRect().width - 50})
  }

  render() {
    const { comments, customFields, customValues, onChangeCustomValue } = this.props
    const { width } = this.state
    const data = comments.map(comment => {
      return {
        ...comment,
        ...customValues[comment.id]
      }
    })
    const colHeaders = [
      ...defaultColHeaders,
      ...(customFields.map(f => f.label))
    ]
    const columns = [
      ...defaultColumns,
      ...(customFields.map(f => {
        switch (f.type) {
        case 'text':
          return { data: f.id, type: 'text' }
        case 'dropdown':
          return { data: f.id, type: 'dropdown', source: f.source }
        default:
          throw new Error(`Unknown column type: ${f.type}`)
        }
      }))
    ]

    return (
      <div>
        <h3 className="ui top attached header">List of Comments</h3>
        <div className="ui attached segment" ref={c => { this.container = c }}>
          <HotTable settings={{
                      data,
                      colHeaders,
                      columns,
                      width,
                      allowInsertColumn: false,
                      allowInsertRow: false,
                      onAfterSetDataAtCell: (changes) => {
                        changes.forEach(([row, col, oldValue, value]) => {
                          onChangeCustomValue(data[row].id, col, value)
                        })
                      }
                    }}/>
        </div>
      </div>
    )
  }
}

ReviewCommentTable.propTypes = {
  comments: PropTypes.array,
  customFields: PropTypes.array,
  customValues: PropTypes.object
}
