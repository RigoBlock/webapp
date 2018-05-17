import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import  * as Colors from 'material-ui/styles/colors'
import styles from './orderBox.module.css'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import ButtonBuy from '../atoms/buttonBuy'
import ButtonSell from '../atoms/buttonSell'
import OrderAmount from '../atoms/orderAmount'
import OrderPrice from '../atoms/orderPrice'
import ButtonOrderSubmit from '../atoms/buttonOrderSubmit'
import ButtonOrderCancel from '../atoms/buttonOrderCancel'
import OrderSummary from '../molecules/orderSummary'
import OrderRawDialog from '../molecules/orderRawDialog'
import OrderTypeSelector from '../atoms/orderTypeSelector'
import Toggle from 'material-ui/Toggle';
import { connect } from 'react-redux';
import {
  UPDATE_SELECTED_ORDER,
  CANCEL_SELECTED_ORDER,
  SET_TOKEN_ALLOWANCE
} from '../../_utils/const'
import { signOrder, sendOrderToRelay, newMakerOrder, fillOrderToExchange } from '../../_utils/exchange'


function mapStateToProps(state) {
  return state
}

const paperStyle = {
  padding: "10px"
}

class OrderBox extends Component {

  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    orderRawDialogOpen: false
  }

  static defaultProps = {
  };

  static contextTypes = {
    exchangeUtils: PropTypes.object.isRequired,
  };

  onCloseOrderRawDialog = (open) => {
    this.setState({
      orderRawDialogOpen: open
    })
  }

  updateSelectedOrder = (payload) => {
    return {
      type: UPDATE_SELECTED_ORDER,
      payload: payload
    }
  };

  cancelSelectedOrder = () => {
    return {
      type: CANCEL_SELECTED_ORDER,
    }
  };

  onChangeAmount = (amount, error) => {
    const payload = {
      orderAmountError: error,
      orderFillAmount: amount,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onChangePrice = (amount, error) => {
    const payload = {
      orderPriceError: error,
      orderPrice: amount,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onSubmitOrder = async () => {
    const { selectedOrder, selectedExchange } = this.props.exchange
    if (selectedOrder.takerOrder) {
      fillOrderToExchange(selectedOrder.details.order, selectedOrder.orderFillAmount, selectedExchange)
    }
    else {
      console.log(selectedOrder)
      var signedOrder = await signOrder(selectedOrder, selectedExchange)
      console.log(signedOrder)
      const payload = {
        details: { order: signedOrder },
      }
      this.props.dispatch(this.updateSelectedOrder(payload))
      this.setState({
        orderRawDialogOpen: true
      })
      sendOrderToRelay(signedOrder)
        .then(function (parsedBody) {
          console.log(parsedBody)
        })
        .catch(function (err) {
          console.log(err)
        });
    }
  }

  onCancelOrder = () => {
    this.props.dispatch(this.cancelSelectedOrder())
  }

  onSelectOrderType = () => {

  }

  onToggleActivateTokenTrade = () => {
    const { selectedTokensPair, selectedExchange, makerAddress } = this.props.exchange
    const payload = {
        type: SET_TOKEN_ALLOWANCE,
        payload: {
          tokenAddress: selectedTokensPair.baseToken.address,
          ownerAddress: makerAddress,
          spenderAddress: selectedExchange.tokenTransferProxyAddress,
          ZeroExConfig: selectedExchange
        }
    }
    this.props.dispatch(payload)
  }

  onBuySell = async (orderType) => {
    const { selectedTokensPair, selectedExchange } = this.props.exchange
    const order = await newMakerOrder(orderType, selectedTokensPair.baseToken.address, selectedTokensPair.quoteToken.address, selectedExchange)
    const payload = {
      details: {
        order: order,
        orderAmount: 0,
        orderPrice: 0,
        orderType: orderType
      },
      orderAmountError: true,
      orderPriceError: true,
      orderFillAmount: '0',
      orderMaxAmount: '0',
      orderPrice: '0',
      orderType: orderType,
      takerOrder: false,
      selectedTokensPair: selectedTokensPair,
    }

    this.props.dispatch(this.updateSelectedOrder(payload))
  }


  render() {
    const { selectedOrder, selectedTokensPair } = this.props.exchange
    var buySelected = (selectedOrder.orderType === 'bids')
    var sellSelected = (selectedOrder.orderType === 'asks')
    if (selectedOrder.takerOrder) {
      buySelected = (selectedOrder.orderType === 'asks')
      sellSelected = (selectedOrder.orderType === 'bids')
    }

    const aggregatedTogglestyles = {
      block: {
        maxWidth: 250,
      },
      toggle: {
        // paddingRight: '5px',
      },
      trackSwitched: {
        backgroundColor: '#bdbdbd',
      },
      thumbSwitched: {
        backgroundColor: Colors.blue500,
      },
      labelStyle: {
        fontSize: '12px',
        opacity: '0.5',
        textAlign: 'right'
      },
    };

    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <AppBar
                title='ORDER BOX'
                showMenuIconButton={false}
                className={styles.appBar}
                titleStyle={{ fontSize: 14 }}
              />
              <Paper style={paperStyle} zDepth={1} >
                <Row className={styles.orderBookContainer}>
                  <Col xs={12}>
                    <Row className={styles.sectionHeaderOrderTable}>
                      <Col xs={6} className={styles.buyButton}>
                        <ButtonBuy
                          selected={buySelected}
                          onBuySell={this.onBuySell}
                        />
                      </Col>
                      <Col xs={6} className={styles.sellButton}>
                        <ButtonSell
                          selected={sellSelected}
                          onBuySell={this.onBuySell}
                        />
                      </Col>
                    </Row>
                  </Col>


                  <Col xs={12} className={styles.tokenNameSymbol}>
                    <div className={styles.tokenSymbol}>{selectedTokensPair.baseToken.symbol}</div>
                    <div className={styles.tokenName}>{selectedTokensPair.baseToken.name}</div>
                    <div>
                    <Toggle
                          label="ACTIVATE"
                          style={aggregatedTogglestyles.toggle}
                          // thumbStyle={aggregatedTogglestyles.thumbOff}
                          trackStyle={aggregatedTogglestyles.trackOff}
                          thumbSwitchedStyle={aggregatedTogglestyles.thumbSwitched}
                          trackSwitchedStyle={aggregatedTogglestyles.trackSwitched}
                          labelStyle={aggregatedTogglestyles.labelStyle}
                          onToggle={this.onToggleActivateTokenTrade}
                          toggled={selectedTokensPair.baseTokenAllowance}
                        />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <OrderTypeSelector
                      orderTypes={['Market', 'Limit']}
                      onSelectOrderType={this.onSelectOrderType}
                    />

                  </Col>

                  <Col xs={12}>
                    <OrderAmount
                      orderMaxAmount={Number(selectedOrder.orderMaxAmount)}
                      orderFillAmount={selectedOrder.orderFillAmount}
                      symbol={selectedOrder.selectedTokensPair.baseToken.symbol}
                      onChangeAmount={this.onChangeAmount}
                      disabled={Object.keys(selectedOrder.details).length === 0}
                      checkMaxAmount={selectedOrder.takerOrder}
                    />

                  </Col>
                  <Col xs={12}>
                    <OrderPrice
                      orderPrice={selectedOrder.orderPrice}
                      onChangePrice={this.onChangePrice}
                      disabled={selectedOrder.takerOrder || Object.keys(selectedOrder.details).length === 0}
                    />
                  </Col>
                  <Col xs={12}>
                    <Row center="xs">
                      <Col xs={6}>
                        <ButtonOrderCancel
                          onCancelOrder={this.onCancelOrder}
                          disabled={Object.keys(selectedOrder.details).length === 0}
                        />
                      </Col>
                      <Col xs={6}>
                        <ButtonOrderSubmit
                          onSubmitOrder={this.onSubmitOrder}
                          disabled={selectedOrder.orderAmountError || selectedOrder.orderPriceError}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12}>
                    {
                      (Object.keys(selectedOrder.details).length !== 0)
                        ? <OrderSummary order={selectedOrder} />
                        : null
                    }
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
        <OrderRawDialog order={selectedOrder.details.order} onClose={this.onCloseOrderRawDialog} open={this.state.orderRawDialogOpen} />
      </Row>
    )
  }
}

export default connect(mapStateToProps)(OrderBox)