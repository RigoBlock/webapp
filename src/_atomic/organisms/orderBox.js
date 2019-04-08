import { Col, Row } from 'react-flexbox-grid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import * as Colors from 'material-ui/styles/colors'
import BoxTitle from '../atoms/boxTitle'
import ButtonOrderBuy from '../atoms/buttonOrderBuy'
import ButtonOrderConfirm from '../atoms/buttonOrderConfirm'
import ButtonOrderReset from '../atoms/buttonOrderReset'
import ButtonOrderSell from '../atoms/buttonOrderSell'
import CheckBoxQuickOrder from '../molecules/checkBoxQuickOrder'
import OrderAmountInputField from '../atoms/orderAmountInputField'
import OrderPrice from '../atoms/orderPrice'
import OrderRawDialog from '../molecules/orderRawDialog'
import OrderSummary from '../molecules/orderSummary'
import Paper from 'material-ui/Paper'
import styles from './orderBox.module.css'
// import OrderTypeSelector from '../atoms/orderTypeSelector'
import { Actions } from '../../_redux/actions'
import { connect } from 'react-redux'
import {
  fillOrderToExchangeViaProxy, // TODO: upgrade to 0x v2
  signOrder,
  submitOrderToRelayEFX
} from '../../_utils/exchange'
import { sha3_512 } from 'js-sha3'
// import ToggleSwitch from '../atoms/toggleSwitch'
import { notificationWrapper } from '../../_utils/notificationWrapper'
import { toBaseUnitAmount } from '../../_utils/format'
import BigNumber from 'bignumber.js'
import BoxDecorator from '../molecules/boxDecorator'
import ShowStatusMsg from '../atoms/showStatusMsg'
import moment from 'moment'
import serializeError from 'serialize-error'
import utils from '../../_utils/utils'

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
    endpoint: { networkInfo: { id: state.endpoint.networkInfo.id } },
    exchange: {
      selectedTokensPair: state.exchange.selectedTokensPair,
      selectedOrder: state.exchange.selectedOrder,
      walletAddress: state.exchange.walletAddress,
      selectedExchange: state.exchange.selectedExchange,
      selectedFund: state.exchange.selectedFund,
      selectedRelay: state.exchange.selectedRelay,
      ui: {
        panels: { orderBox: state.exchange.ui.panels.orderBox }
      }
    }
  }
}
class OrderBox extends Component {
  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired
  }

  state = {
    orderRawDialogOpen: false,
    efxOrder: {},
    orderSubmitStep: 0,
    orderOptions: {
      quickOrder: false
    },
    showWarnMsg: ''
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  onCloseOrderRawDialog = (dialogOpen, cancelOrder) => {
    if (cancelOrder) {
      this.onCancelOrder()
      return
    }
    this.setState({
      orderRawDialogOpen: dialogOpen
    })
  }

  onSetOrderOptions = option => {
    let newOrderOptions = { ...this.state.orderOptions, ...option }
    this.setState({
      orderOptions: newOrderOptions
    })
  }

  onChangeAmount = (amount, error) => {
    const payload = {
      orderAmountError: error,
      orderFillAmount: amount
    }
    console.log(amount)
    this.props.dispatch(Actions.exchange.updateOrder(payload))
  }

  onChangePrice = (amount, error) => {
    const payload = {
      orderPriceError: error,
      orderPrice: amount
    }
    console.log(amount)
    this.props.dispatch(Actions.exchange.updateOrder(payload))
  }

  onConfirmOrder = async () => {
    const {
      selectedOrder,
      selectedExchange,
      walletAddress,
      selectedTokensPair,
      selectedFund
    } = this.props.exchange

    let balanceWrapper, decimals, orderAmountBaseUnit, tokenSymbol

    // Checking if the locked balance is enough.
    switch (selectedOrder.orderType) {
      case 'asks':
        balanceWrapper = selectedFund.liquidity.baseToken.balanceWrapper
        decimals = selectedTokensPair.baseToken.decimals
        tokenSymbol = selectedTokensPair.baseToken.symbol
        orderAmountBaseUnit = toBaseUnitAmount(
          selectedOrder.orderFillAmount,
          decimals
        )
        if (orderAmountBaseUnit.gt(balanceWrapper)) {
          this.setState({
            showWarnMsg: `You do not have enough ${tokenSymbol} locked.`
          })
          return
        }
        break
      case 'bids':
        balanceWrapper = selectedFund.liquidity.quoteToken.balanceWrapper
        decimals = selectedTokensPair.quoteToken.decimals
        tokenSymbol = selectedTokensPair.quoteToken.symbol
        orderAmountBaseUnit = toBaseUnitAmount(
          new BigNumber(selectedOrder.orderFillAmount).times(
            new BigNumber(selectedOrder.orderPrice)
          ),
          decimals
        )

        if (orderAmountBaseUnit.gt(balanceWrapper)) {
          this.setState({
            showWarnMsg: `You do not have enough ${tokenSymbol} locked.`
          })
          return
        }
        break
      default:
    }

    if (!this.state.orderOptions.quickOrder) {
      this.setState({
        orderRawDialogOpen: true
      })
    }
    console.log('Selected order', selectedOrder)
    try {
      let signedOrder = await signOrder(
        selectedOrder,
        selectedExchange,
        walletAddress
      )
      console.log('Selected order', selectedOrder)
      console.log('Signed order', signedOrder)
      console.log(signedOrder)
      const payload = {
        details: { order: signedOrder }
      }
      this.props.dispatch(Actions.exchange.updateOrder(payload))

      if (this.state.orderOptions.quickOrder) {
        this.onSubmitOrder(null, null, { ...selectedOrder, ...payload })
        return
      }

      this.setState({
        orderSubmitStep: 1
      })
    } catch (error) {
      console.warn(error)
      const notificationEngine = notificationWrapper.getInstance()
      utils.notificationError(notificationEngine, serializeError(error).message)
      this.setState({
        orderRawDialogOpen: false
      })
    }
  }

  onCheckOrder = async () => {
    this.setState({
      orderSubmitStep: 2
    })
  }

  onSubmitOrder = async (event = null, value = null, order = null) => {
    const {
      selectedExchange,
      selectedFund,
      selectedRelay
    } = this.props.exchange
    const selectedOrder = order || this.props.exchange.selectedOrder
    const { endpoint } = this.props
    const transactionId = sha3_512(new Date() + selectedFund.managerAccount)
    let transactionDetails = {
      status: 'pending',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: selectedFund.details.address,
      error: false,
      action: selectedOrder.orderType === 'asks' ? 'BuyToken' : 'SellToken',
      symbol: selectedOrder.selectedTokensPair.baseToken.symbol.toUpperCase(),
      amount: selectedOrder.orderFillAmount
    }
    this.props.dispatch(
      Actions.transactions.addTransactionToQueueAction(
        transactionId,
        transactionDetails
      )
    )

    if (selectedOrder.takerOrder) {
      try {
        const receipt = await fillOrderToExchangeViaProxy(
          selectedFund,
          selectedOrder.details.order,
          selectedOrder.orderFillAmount,
          selectedExchange
        )
        console.log(receipt)
        transactionDetails.status = 'executed'
        transactionDetails.receipt = receipt
        transactionDetails.hash = receipt.transactionHash
        transactionDetails.timestamp = new Date()
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        Actions.updateLiquidityAndTokenBalances(
          '',
          selectedFund.details.address
        )
      } catch (error) {
        console.log(serializeError(error))
        const errorArray = serializeError(error).message.split(/\r?\n/)
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        const notificationEngine = notificationWrapper.getInstance()
        utils.notificationError(
          notificationEngine,
          serializeError(error).message
        )
      }
    } else {
      console.log(selectedOrder)
      let signedOrder = selectedOrder.details.order
      try {
        if (selectedRelay.name === 'Ethfinex') {
          console.log('Ethfinex order')
          let efxSymbol = `t${selectedOrder.selectedTokensPair.baseToken.symbol.toUpperCase()}${selectedOrder.selectedTokensPair.quoteToken.symbolTicker.Ethfinex.toUpperCase()}`
          let efxAmount =
            selectedOrder.orderType === 'asks'
              ? (-Math.abs(selectedOrder.orderFillAmount)).toString()
              : selectedOrder.orderFillAmount

          // TODO: try adjust price here
          /*const EFX = require('efx-api-node')
          const web3 = new EFX.Web3(window.web3.currentProvider) // current ethereum provider
          const efx = await EFX( web3 )*/

          const efxOrder = {
            type: 'EXCHANGE LIMIT',
            symbol: efxSymbol,
            amount: efxAmount,
            price: selectedOrder.orderPrice,
            meta: signedOrder,
            protocol: '0x'
          }
          efxOrder.meta.sigType = 'contract'
          this.setState({
            efxOrder
          })
          console.log(efxSymbol, efxAmount, selectedOrder.orderPrice)
          console.log(efxOrder)
          let parsedBody = await submitOrderToRelayEFX(
            efxOrder,
            endpoint.networkInfo.id
          )
          this.setState({
            orderSubmitStep: 3
          })
          transactionDetails.status = 'executed'
          transactionDetails.timestamp = new Date()
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
          if (this.state.orderOptions.quickOrder) {
            this.onCancelOrder()
          }
          console.log(parsedBody)
        }
      } catch (error) {
        const errorArray = serializeError(error).message.split(/\r?\n/)
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        console.log(error)
        const notificationEngine = notificationWrapper.getInstance()
        utils.notificationError(
          notificationEngine,
          serializeError(error).message
        )
      }
    }
  }

  onCancelOrder = () => {
    this.props.dispatch(Actions.exchange.cancelSelectedOrder())
    this.setState({
      orderOptions: {
        quickOrder: false
      },
      orderSubmitStep: 0,
      orderRawDialogOpen: false
    })
  }

  onSelectOrderType = () => {}

  onBuySell = async orderType => {
    console.log(orderType)
    const { selectedTokensPair } = this.props.exchange

    if (orderType === 'asks') {
      if (
        moment
          .unix(selectedTokensPair.baseTokenLockWrapExpire)
          .isBefore(moment())
      ) {
        this.setState({
          showWarnMsg: 'Please lock some ' + selectedTokensPair.baseToken.symbol
        })
        return
      }
    } else {
      if (
        moment
          .unix(selectedTokensPair.quoteTokenLockWrapExpire)
          .isBefore(moment())
      ) {
        this.setState({
          showWarnMsg:
            'Please lock some ' + selectedTokensPair.quoteToken.symbol
        })
        return
      }
    }
    this.setState({
      showWarnMsg: ''
    })
    this.props.dispatch(Actions.exchange.createOrder(orderType))
  }

  render() {
    const {
      selectedOrder,
      ui: {
        panels: { orderBox }
      }
    } = this.props.exchange
    let buySelected = selectedOrder.orderType === 'bids'
    let sellSelected = selectedOrder.orderType === 'asks'
    if (selectedOrder.takerOrder) {
      buySelected = selectedOrder.orderType === 'asks'
      sellSelected = selectedOrder.orderType === 'bids'
    }
    const { showWarnMsg } = this.state
    const paperStyle = {
      padding: '5px',
      display: orderBox.expanded ? 'inline-block' : 'none'
    }
    return (
      <BoxDecorator boxName={'relayBox'}>
        <Row>
          <Col xs={12}>
            <Row className={styles.sectionTitle}>
              <Col xs={12}>
                <BoxTitle titleText={'ORDER BOX'} boxName={'orderBox'} />
                <Paper style={paperStyle} zDepth={1}>
                  <Row>
                    <Col xs={12}>
                      <CheckBoxQuickOrder
                        onCheck={this.onSetOrderOptions}
                        checked={this.state.orderOptions.quickOrder}
                      />
                    </Col>
                  </Row>
                  <Row className={styles.orderBookContainer}>
                    <Col xs={12}>
                      <Row className={styles.sectionHeaderOrderTable}>
                        <Col sm={12} md={6} className={styles.buyButton}>
                          <ButtonOrderBuy
                            selected={buySelected}
                            onBuySell={this.onBuySell}
                          />
                        </Col>
                        <Col sm={12} md={6} className={styles.sellButton}>
                          <ButtonOrderSell
                            selected={sellSelected}
                            onBuySell={this.onBuySell}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={12}>
                      {showWarnMsg && (
                        <ShowStatusMsg
                          msg={showWarnMsg}
                          status="warning"
                          onClose={() => {
                            this.setState({ showWarnMsg: false })
                          }}
                        />
                      )}
                    </Col>
                    <Col xs={12}>
                      <OrderAmountInputField
                        orderMaxAmount={Number(selectedOrder.orderMaxAmount)}
                        orderFillAmount={selectedOrder.orderFillAmount}
                        symbol={
                          selectedOrder.selectedTokensPair.baseToken.symbol
                        }
                        onChangeAmount={this.onChangeAmount}
                        disabled={
                          Object.keys(selectedOrder.details).length === 0
                        }
                        checkMaxAmount={selectedOrder.takerOrder}
                      />
                    </Col>
                    <Col xs={12}>
                      <OrderPrice
                        orderPrice={selectedOrder.orderPrice}
                        onChangePrice={this.onChangePrice}
                        disabled={
                          selectedOrder.takerOrder ||
                          Object.keys(selectedOrder.details).length === 0
                        }
                      />
                    </Col>
                    <Col xs={12}>
                      <Row center="xs">
                        <Col sm={12} md={6}>
                          <ButtonOrderReset
                            onClick={this.onCancelOrder}
                            disabled={
                              Object.keys(selectedOrder.details).length === 0
                            }
                          />
                        </Col>
                        <Col sm={12} md={6}>
                          <ButtonOrderConfirm
                            onClick={this.onConfirmOrder}
                            disabled={
                              selectedOrder.orderAmountError ||
                              selectedOrder.orderPriceError
                            }
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={12}>
                      {Object.keys(selectedOrder.details).length !== 0 ? (
                        <OrderSummary order={selectedOrder} />
                      ) : null}
                    </Col>
                  </Row>
                </Paper>
              </Col>
            </Row>
          </Col>
          <OrderRawDialog
            order={selectedOrder}
            efxOrder={this.state.efxOrder}
            // exchange={this.props.exchange}
            onSubmitOrder={this.onSubmitOrder}
            onCheckOrder={this.onCheckOrder}
            orderSubmitStep={this.state.orderSubmitStep}
            onClose={this.onCloseOrderRawDialog}
            open={this.state.orderRawDialogOpen}
            // open={true}
          />
        </Row>
      </BoxDecorator>
    )
  }
}

export default connect(mapStateToProps)(OrderBox)
