import PropTypes from 'prop-types';
import React, { Component } from 'react';
// import { Row, Col } from 'react-flexbox-grid';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const customContentStyle = {
  height: '400px',
  wordWrap: 'break-word'
};

class OrderRawDialog extends Component {

  static propTypes = {
    order: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
  };


  handleClose = () => {
    this.props.onClose(false);
  };

  render() {
    const actions = [
      <FlatButton
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleClose}
      />,
    ];

    return (
      <div>
        {/* <RaisedButton label="Alert" onClick={this.handleOpen} /> */}
        <Dialog
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={this.handleClose}
          contentStyle={customContentStyle}
        >
          {JSON.stringify(this.props.order)}
        </Dialog>
      </div>
    );
  }
}

export default OrderRawDialog