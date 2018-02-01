import  * as Colors from 'material-ui/styles/colors'
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './elementPricesBox.module.css';
import ElementFundActions from '../Elements/elementFundActions'
import FlatButton from 'material-ui/FlatButton'

export default class ElementPriceBox extends Component {

  static propTypes = {
    dragoDetails: PropTypes.object.isRequired,
    accounts: PropTypes.array,
    handleBuySellButtons: PropTypes.func,
    isManager: PropTypes.bool
  };

  buttonBuyClick = () =>{
    this.props.handleBuySellButtons('buy')
  }
  
  buttonSellClick = () =>{
    this.props.handleBuySellButtons('sell')
  }
  
  render () {
    const buyText = {
      color: Colors.green300,
    }

    const sellText = {
      color: Colors.red300,
    }

    const priceBox = {
      padding: 0,
      textAlign: 'center',
      fontSize: 25,
    }

    const priceBoxHeader = {
      buy: {
        backgroundColor: Colors.green300
      },
      sell: {
        backgroundColor: Colors.red300
      },
      marketPrice: {
        backgroundColor: Colors.blue500,
        fontWeight: 500
      },
    }

    const priceBoxHeaderTitleStyle = {
      padding: 0,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 500,
    }

    const {dragoDetails, accounts, isManager} = this.props

    const buttonBuyStyle = {
      border: "1px solid",
      borderColor: Colors.green200,
      // width: "140px"
    }

    const buttonSellStyle = {
      border: "1px solid",
      borderColor: Colors.red200,
      // width: "140px"
    }

    if(!isManager) {
      return (
        <div>
          <Row>
            <Col xs={12} className={styles.boxHeader}>
              <AppBar
                title="TRADE"
                showMenuIconButton={false}
                style={priceBoxHeader.marketPrice}
                titleStyle={priceBoxHeaderTitleStyle}
              />
            </Col>
          </Row>
          <Row middle="xs" className={styles.row}>

            <Col xs={6}>
              <div className={styles.price}>{dragoDetails.buyPrice} <small>ETH</small></div>
            </Col>
            <Col xs={6}>
              <div className={styles.price}>{dragoDetails.buyPrice} <small>ETH</small></div>
            </Col>
          </Row>
          <Row middle="xs" className={styles.row}>
          <Col xs={6}>
              <div className={styles.actionButton}><FlatButton primary={true} label="Sell"
                labelStyle={{ fontWeight: 700, fontSize: '18px', color: Colors.red500 }}
                onClick={this.buttonSellClick}
                style={buttonSellStyle}
                hoverColor={Colors.red50}
              /></div>
            </Col>
            <Col xs={6}>
              <div className={styles.actionButton}><FlatButton primary={true} label="Buy"
                labelStyle={{ fontWeight: 700, fontSize: '18px', color: Colors.green500 }}
                onClick={this.buttonBuyClick}
                style={buttonBuyStyle}
                hoverColor={Colors.lightGreen50}
              /></div>
            </Col>

          </Row>


          {/* <Row middle="xs">
            <Col xs={4}>
              <div className={styles.buyHeader}>
                Ask
              </div>
            </Col>
            <Col xs={4}>
              <div className={styles.price}>{dragoDetails.buyPrice} <small>ETH</small></div>
            </Col>
            <Col xs={2}>
              <div className={styles.actionButton}><FlatButton primary={true} label="Buy" 
              labelStyle={{ fontWeight: 700, fontSize: '18px', color: Colors.green500 }} 
              onClick={this.buttonBuyClick}
              style={buttonBuyStyle}
              hoverColor={Colors.lightGreen50}
              /></div>
            </Col>
          </Row>
          <Row middle="xs">
            <Col xs={4}>
              <div className={styles.sellHeader}>
                Bid
              </div>
            </Col>
            <Col xs={4}>
              <div className={styles.price}>{dragoDetails.sellPrice} <small>ETH</small></div>
            </Col>
            <Col xs={2}>
              <div className={styles.actionButton}><FlatButton primary={true} label="Sell" 
              labelStyle={{ fontWeight: 700, fontSize: '18px', color: Colors.red500 }} 
              onClick={this.buttonSellClick}
              style={buttonSellStyle}
              hoverColor={Colors.red50}
              /></div>
            </Col>
          </Row> */}
        </div>
      );
    }

    if(isManager) {
      return (
        <div>
          <Row>
            <Col xs={12} className={styles.boxHeader}>
              <AppBar
                title="MARKET"
                showMenuIconButton={false}
                style={priceBoxHeader.marketPrice}
                titleStyle={priceBoxHeaderTitleStyle}
              />
            </Col>
          </Row>
          <Row middle="xs">
            <Col xs={4}>
              <div className={styles.buyHeader}>
                Ask
              </div>
            </Col>
            <Col xs={7}>
              <div className={styles.price}>{dragoDetails.buyPrice} ETH</div>
            </Col>
          </Row>
          <Row middle="xs">
            <Col xs={4}>
              <div className={styles.sellHeader}>
                Bid
              </div>
            </Col>
            <Col xs={7}>
              <div className={styles.price}>{dragoDetails.sellPrice} ETH</div>
            </Col>
          </Row>
        </div>
      );
    }


  }
}
