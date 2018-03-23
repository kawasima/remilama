import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
import { Form, Field } from 'react-final-form'

const reviewCommentSource = {
  beginDrag(props) {
    return {
      commentId: props.id
    }
  },
  endDrag({id, onMoveComment, x, y, scale}, monitor) {
    const delta = monitor.getDifferenceFromInitialOffset()
    onMoveComment({
      id,
      x: (x * scale + delta.x) / scale,
      y: (y * scale + delta.y) / scale
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
  state = {
    visible: true,
    editing: false
  }

  renderForm = () => {
    const {id, description, onUpdateComment} = this.props
    return (
      <Form
        onSubmit={values => {
          this.setState({ editing: false })
          onUpdateComment(id, values.description)
        }}
        initialValues={{ description }}
        render={({ handleSubmit, prinstine, invalid }) => {
          const onKeyPress = (e) => {
            if (e.key === 'Enter') {
              handleSubmit(e)
            }
          }
          const handlePropagationStop = (e) => e.stopPropagation()
          const textarea = ({ input, meta }) => (
                  <textarea {...input}
                            onKeyPress={onKeyPress}
                            onClick={handlePropagationStop}/>
          )
          return (
            <form onSubmit={handleSubmit}>
              <Field name="description" render={textarea} />
            </form>
          )
        }}
      />
    )
  }

  renderDeleteButton(id, onDeleteComment) {
    return (
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
    )
  }

  renderDescription = ({description}) => (
    <div>
      {description}
    </div>
  )

  render() {
    const {
      id, x, y, scale, description, postedBy,
      reviewer,
      onDeleteComment,
      isDragging,
      connectDragSource
    } = this.props

    const deleteButton = (reviewer && reviewer.id === postedBy.id) ? this.renderDeleteButton(id, onDeleteComment) : null

    const content = this.state.editing ?
          this.renderForm()
          :
          this.renderDescription({description})

    return connectDragSource(
      <div className="ui segment"
           style={{
          position: 'absolute',
          margin: 0,
             minWidth: '300px',
             left: x * scale,
             top: y * scale,
             background: 'linear-gradient(to right, #ffffcccc 0%, #f1f1c1cc 0.5%, #f1f1c1cc 13%, #ffffcccc 16%)',
             border: '1px solid #E8E8E8',
             visibility: isDragging ? 'hidden' : 'visible'
           }}
           onClick={(e) => this.setState({editing: true})}>
        {deleteButton}
        {content}
      </div>
    )
  }

  static propTypes = {
    id: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    file: PropTypes.string,
    postedBy: PropTypes.object,
    page: PropTypes.number,
    scale: PropTypes.number,
    description: PropTypes.string,
    onUpdateComment: PropTypes.func.isRequired,
    onMoveComment: PropTypes.func.isRequired,
    onDeleteComment: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    reviewer: PropTypes.object
  }


}

export default DragSource('ReviewComment', reviewCommentSource, collect)(ReviewComment)
