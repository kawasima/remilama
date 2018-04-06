import React from 'react'
import ReactModal from 'react-modal'

ReactModal.setAppElement('#root')

class Modal extends React.Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  render() {
    const {modalIsOpen} = this.props
    this.state.modalIsOpen = modalIsOpen
    return(
      <div>
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          overlayClassName="ui dimmer modals top aligned page transition visible active"
          className="ui standard modal transition visible active"
        >
          {this.props.children}
        </ReactModal>
      </div>
    )
  }
}

export default Modal