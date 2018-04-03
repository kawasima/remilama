import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import HotTable from '../components/HotTable'

const defaultColHeaders = [
  'ID',
  'PostedBy',
  'Description',
  'Document name',
  'Page'
]

export default class ReviewCommentTable extends React.Component {
  state = {
    width: 800
  }

  componentDidMount() {
    const container = this.container
    this.setState({width: container.getBoundingClientRect().width - 50})
  }

  idRenderer(instance, td, row, col, prop, value) {
    const { comments, onGoToPage, onSelectFile } = this.props
    if (value) {
      ReactDOM.render(
        <a href="javascript:void(0)" onClick={() => {
            onSelectFile(comments[row].filename)
            onGoToPage(comments[row].page)
          }}>
          {value.replace(/-.*$/, '')}
        </a>
        , td)
    }
    return td;
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
      {
        data: 'id',
        renderer: (instance, td, row, col, prop, value) => this.idRenderer(instance, td, row, col, prop, value),
        readonly: true
      },
      {data: 'postedBy.name', readOnly: true},
      {data: 'description', readOnly: true},
      {data: 'filename', readOnly: true},
      {data: 'page', readOnly: true},
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
                      onAfterChange: (changes) => {
                        if (changes === null) return
                        changes.forEach(([row, col, oldValue, value]) => {
                          setTimeout(() => onChangeCustomValue(data[row].id, col, value), 100)
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
  customValues: PropTypes.object,
  onChangeCustomValue: PropTypes.func,
  onGoToPage: PropTypes.func,
  onSelectFile: PropTypes.func
}
