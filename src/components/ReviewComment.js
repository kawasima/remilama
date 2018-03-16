import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
import { Form, Field } from 'react-final-form'

const reviewCommentSource = {
  beginDrag(props) {
    return {}
  },
  endDrag({id, onMoveComment, offsetLeft, offsetTop}, monitor) {
    const position = monitor.getClientOffset()
    onMoveComment({
      id,
      x: position.x,
      y: position.y - offsetTop
    })
  }
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class ReviewComment extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    file: PropTypes.string,
    page: PropTypes.number,
    offsetTop: PropTypes.number,
    offsetLeft: PropTypes.number,
    description: PropTypes.string,
    onPostComment: PropTypes.func.isRequired,
    onMoveComment: PropTypes.func.isRequired,
    onDeleteComment: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired
  }

  state = {
    visible: true,
    editing: false
  }

  renderForm = () => {
    const {id, description, onPostComment} = this.props
    return (
      <Form
        onSubmit={values => {
          this.setState({ editing: false })
          onPostComment(id, values.description)
        }}
        render={({ handleSubmit, prinstine, invalid }) => (
          <form onSubmit={handleSubmit}>
            <Field
              name='description'
              value={description}
              render={({ input, meta }) => (
                <textarea {...input} onKeyPress={ (e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e)
                    }
                  }} />
              )}
            />
          </form>
        )}
      />
    )
  }

  render() {
    const {
      id, x, y, description, offsetTop, offsetLeft, onDeleteComment,
      isDragging,
      connectDragSource
    } = this.props
    const content = this.state.editing ?
          this.renderForm()
          :
          <div>{description}</div>

    return connectDragSource(
      <div className="ui segment visible"
           style={{
             position: 'absolute',
             minWidth: '300px',
             left: x,
             top: offsetTop + y,
             background: 'linear-gradient(to right, #ffffcccc 0%, #f1f1c1cc 0.5%, #f1f1c1cc 13%, #ffffcccc 16%)',
             border: '1px solid #E8E8E8'
           }}
           onClick={(e) => this.setState({editing: true})}>
        <div className="ui right floated mini button"
             style={{
             position: 'absolute',
             backgroundColor: 'transparent',
             padding:0,
             right:0,
             top:0
             }}
             onClick={(e) => {
          e.stopPropagation()
          onDeleteComment(id)
          }}>
          <i className="red small times icon"></i>
        </div>
        {content}
      </div>
    )
  }
}

export default DragSource('ReviewComment', reviewCommentSource, collect)(ReviewComment)
