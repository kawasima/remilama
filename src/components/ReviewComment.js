import React from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'

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
    onPostComment: PropTypes.func.required
  }

  state = {
    visible: true,
    editing: true
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
    const { x, y, description, offsetTop, offsetLeft } = this.props
    const content = this.state.editing ?
          this.renderForm()
          :
          <div>{description}</div>

    return (
      <div className="ui popup top left visible"
           style={{
             position: 'absolute',
             left: offsetLeft + x,
             top: offsetTop + y,
             background: 'ffff88',
             border: '1px solid #E8E8E8'
           }}
           onClick={(e) => this.setState({editing: true})}>
        {content}
      </div>
    )
  }
}

export default ReviewComment
