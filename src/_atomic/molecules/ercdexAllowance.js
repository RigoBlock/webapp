import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from '../../_utils/const'
import { connect } from 'react-redux'
import { notificationWrapper } from '../../_utils/notificationWrapper'
import { setAllowaceOnExchangeThroughDrago } from '../../_utils/exchange'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ToggleSwitch from '../atoms/toggleSwitch'
import serializeError from 'serialize-error'
import styles from './ercdexAllowance.module.css'
import utils from '../../_utils/utils'

function mapStateToProps(state) {
  return state
}

class ErcdexAllowance extends Component {
  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired
  }

  onToggleAllowQuoteTokenTrade = async (event, isInputChecked) => {
    const {
      selectedFund,
      selectedTokensPair,
      selectedExchange
    } = this.props.exchange
    let amount
    isInputChecked
      ? (amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
      : (amount = '0')
    const notificationEngine = notificationWrapper.getInstance()
    try {
      await setAllowaceOnExchangeThroughDrago(
        selectedFund,
        selectedTokensPair.quoteToken,
        selectedExchange,
        amount
      )

      selectedTokensPair.quoteTokenAllowance = isInputChecked
      this.props.dispatch(
        Actions.exchange.updateSelectedTradeTokensPair(selectedTokensPair)
      )
    } catch (error) {

      utils.notificationError(notificationEngine, serializeError(error).message)
    }
  }

  onToggleAllowanceBaseTokenTrade = async (event, isInputChecked) => {
    const {
      selectedFund,
      selectedTokensPair,
      selectedExchange
    } = this.props.exchange
    let amount
    isInputChecked
      ? (amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
      : (amount = '0')
    try {
      await setAllowaceOnExchangeThroughDrago(
        selectedFund,
        selectedTokensPair.baseToken,
        selectedExchange,
        amount
      )

      selectedTokensPair.baseTokenAllowance = isInputChecked
      this.props.dispatch(
        Actions.exchange.updateSelectedTradeTokensPair(selectedTokensPair)
      )
    } catch (error) {

    }
  }

  render() {
    const { selectedTokensPair } = this.props.exchange
    return (
      <Row className={styles.container}>
        <Col xs={12} className={styles.tokenNameSymbol}>
          {/* <div className={styles.tokenSymbol}>
            {selectedTokensPair.baseToken.symbol}
          </div>
          <div className={styles.tokenName}>
            {selectedTokensPair.baseToken.name}
          </div> */}
          <div>
            <ToggleSwitch
              label={'ACTIVATE ' + selectedTokensPair.baseToken.symbol}
              onToggle={this.onToggleAllowanceBaseTokenTrade}
              toggled={selectedTokensPair.baseTokenAllowance}
              toolTip={
                'Activate ' + selectedTokensPair.baseToken.symbol + ' trading'
              }
            />
            <ToggleSwitch
              label={'ACTIVATE ' + selectedTokensPair.quoteToken.symbol}
              onToggle={this.onToggleAllowQuoteTokenTrade}
              toggled={selectedTokensPair.quoteTokenAllowance}
              toolTip={
                'Activate ' + selectedTokensPair.quoteToken.symbol + ' trading'
              }
            />
          </div>
        </Col>
      </Row>
    )
  }
}
export default connect(mapStateToProps)(ErcdexAllowance)
