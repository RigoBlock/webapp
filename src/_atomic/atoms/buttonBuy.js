import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors'
import styles from './buyButton.module.css'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types';

class ButtonBuy extends Component {

  static propTypes = {
    onBuySell: PropTypes.func.isRequired,
    selected: PropTypes.bool
  };

  static defaultProps = {
    selected: false
  };

  buttonBuyClick = () =>{
    this.props.onBuySell('bids')
  }

  render() {

    const buttonBuyStyle = {
      border: "1px solid",
      borderColor: (this.props.selected ? Colors.green400 : Colors.grey400),
      backgroundColor: (this.props.selected ? Colors.green400 : 'white'),
      width: "100%"
    }

    const labelStyle ={
      fontWeight: 700, 
      fontSize: '18px', 
      color:  (this.props.selected ? 'white' : Colors.grey400 )
    }

    return (
      <div><FlatButton primary={true} label="Buy"
      labelStyle={labelStyle}
      onClick={this.buttonBuyClick}
      style={buttonBuyStyle}
      hoverColor={Colors.lightGreen50}
    /></div>
    )
  }
}

export default ButtonBuy