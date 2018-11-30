import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { getTokenAllowance } from '../../_utils/exchange'
import BigNumber from 'bignumber.js'
import BoxDecorator from '../molecules/boxDecorator'
import BoxTitle from '../atoms/boxTitle'
import ErcdexAllowance from '../molecules/ercdexAllowance'
import EthfinexAuth from '../molecules/ethfinexAuth'
import ExchangeSelector from '../molecules/exchangeSelector'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SectionTitleExchange from '../atoms/sectionTitleExchange'
import styles from './exchangeBox.module.css'
import utils from '../../_utils/utils'

import { ERC20_TOKENS, RELAYS, TRADE_TOKENS_PAIRS } from '../../_utils/const'

function mapStateToProps(state) {
  return {
    exchange: state.exchange,
    notifications: state.notifications
  }
}

class ExchangeBox extends PureComponent {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired
  }

  onSelectExchange = async relay => {
    if (this.props.exchange.selectedRelay.name === relay) return
    const { api } = this.context
    const { selectedExchange, selectedFund } = this.props.exchange
    const selectedRelay = RELAYS[relay]
    const availableTradeTokensPair = utils.availableTradeTokensPair(
      TRADE_TOKENS_PAIRS,
      RELAYS[relay].name,
      api._rb.network.id
    )
    const baseToken =
      ERC20_TOKENS[api._rb.network.name][
        selectedRelay.defaultTokensPair.baseTokenSymbol
      ]
    const quoteToken =
      ERC20_TOKENS[api._rb.network.name][
        selectedRelay.defaultTokensPair.quoteTokenSymbol
      ]
    const allowanceBaseToken = await getTokenAllowance(
      baseToken,
      selectedFund.details.address,
      selectedExchange
    )
    const allowanceQuoteToken = await getTokenAllowance(
      quoteToken,
      selectedFund.details.address,
      selectedExchange
    )
    const tradeTokensPair = {
      baseToken: baseToken,
      quoteToken: quoteToken,
      baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
      quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0),
      ticker: {
        current: {
          price: '0'
        },
        previous: {
          price: '0'
        },
        variation: 0
      }
    }

    // Resetting current order
    this.props.dispatch(Actions.exchange.cancelSelectedOrder())

    // Updating selected relay
    this.props.dispatch(Actions.exchange.updateSelectedRelay(selectedRelay))

    // Updating available tokens pair
    this.props.dispatch(
      Actions.exchange.updateAvailableTradeTokensPairs(availableTradeTokensPair)
    )
    // Updating selected tokens pair
    this.props.dispatch(
      Actions.exchange.updateSelectedTradeTokensPair(tradeTokensPair)
    )
  }

  showRelayActions = relay => {
    switch (relay.name) {
      case 'Ethfinex':
        return <EthfinexAuth />
      default:
        return <ErcdexAllowance />
    }
  }

  render() {
    const { availableRelays, selectedRelay, ui } = this.props.exchange
    const paperStyle = {
      padding: '5px',
      display: ui.panels.relayBox.expanded ? 'inline-block' : 'none'
    }

    return (
      <BoxDecorator boxName={'relayBox'}>
        <Row className={styles.sectionTitle}>
          <Col xs={12}>
            <BoxTitle titleText={'RELAY'} boxName={'relayBox'} />
            <Paper style={paperStyle} zDepth={1}>
              <Row>
                <Col xs={12}>
                  <SectionTitleExchange titleText="RELAYS" />
                </Col>
                <Col xs={12}>
                  <ExchangeSelector
                    availableRelays={availableRelays}
                    selectedRelay={selectedRelay.name}
                    onSelectExchange={this.onSelectExchange}
                  />
                </Col>
              </Row>
              {this.showRelayActions(selectedRelay)}
            </Paper>
          </Col>
        </Row>
      </BoxDecorator>
    )
  }
}

export default connect(mapStateToProps)(ExchangeBox)
