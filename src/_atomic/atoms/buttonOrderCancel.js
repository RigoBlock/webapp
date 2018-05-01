import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors'
import styles from './buttonOrderCancel.module.css'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types';

class ButtonOrderCancel extends Component {

  static propTypes = {
    onCancelOrder: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }

  render() {

    const buttonOrderSubmitStyle = {
      width: "100%"
    }

    return (this.props.disabled)
    ? (
      <div className={styles.buttonContainer}>
        <FlatButton label="Cancel"
          labelStyle={{ fontWeight: 700, fontSize: '18px' }}
          onClick={this.props.onCancelOrder}
          style={buttonOrderSubmitStyle}
          disabled={this.props.disabled}
        />
      </div>
    )
    : (
      <div className={styles.buttonContainer}>
      <FlatButton primary={true} label="Cancel"
        labelStyle={{ fontWeight: 700, fontSize: '18px' }}
        onClick={this.props.onCancelOrder}
        style={buttonOrderSubmitStyle}
        // hoverColor={Colors.blue400}
        // backgroundColor={Colors.blue500}
      />
    </div>
    )
  }
}

export default ButtonOrderCancel