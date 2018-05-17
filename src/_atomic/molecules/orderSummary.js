import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js'
import Divider from 'material-ui/Divider';
import Web3 from 'web3'

import styles from './orderSummary.module.css'
import classNames from 'classnames';

class OrderSummary extends Component {

  static propTypes = {
    order: PropTypes.object.isRequired,
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

 
  render() {
    const { order } = this.props
    var fee, total, action
    const web3 = new Web3(Web3.currentProvider)
    // price = (order.orderPrice !== '') ? order.orderPrice : '0'
    // amount = (order.orderFillAmount !== '') ? order.orderFillAmount : '0'

    // price = (order.orderPrice !== '') ? order.orderPrice : '0'
    // amount = (order.orderFillAmount !== '') ? order.orderFillAmount : '0'

    const price = () => {
      try {
        new BigNumber(order.orderPrice)
        return order.orderPrice
      }
      catch (error) {
        return 0
      }
    }

    const amount = () => {
      try {
        new BigNumber(order.orderFillAmount)
        return order.orderFillAmount
      }
      catch (error) {
        return 0
      }
    }
    fee = new BigNumber(web3.utils.fromWei(order.details.order.takerFee, 'ether')).toFixed(5)
    total = new BigNumber(price()).mul(amount()).toFixed(5)

    order.takerOrder
    ? action = (order.orderType === 'asks') ? 'buy' : 'sell'
    : action = (order.orderType === 'bids') ? 'buy' : 'sell'

    return (
      
      <Row className={styles.containerOrders}>
        <Col xs={12} className={classNames(styles.action, styles[action])}>
          <div>{action.toUpperCase()}</div>
        </Col>
        <Col xs={12}>
          <div className={styles.title}>SUMMARY</div>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Divider />
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>Quantities</div>
            </Col>
            <Col xs={6}>
            <Row>
              <Col xs={8}>
                <div>{amount()}</div>
              </Col>
              <Col xs={2}>
                <div>{order.selectedTokensPair.baseToken.symbol}</div>
              </Col>
              <Col xs={8}>
                <div>{(amount()*price()).toFixed(5)}</div>
              </Col>
              <Col xs={2}>
                <div>{order.selectedTokensPair.quoteToken.symbol}</div>
              </Col>
              </Row>
            </Col>
            
          </Row>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>Price</div>
            </Col>
            <Col xs={6}>
              <div>{new BigNumber(price()).toFixed(5)}</div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>Fee</div>
            </Col>
            <Col xs={6}>
              <div>{fee}</div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Divider />
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>TOTAL</div>
            </Col>
            <Col xs={6}>
              <div>{total}</div>
            </Col>
          </Row>
        </Col>

      </Row>
    )
  }
}

export default OrderSummary