// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';
// import ApplicationDragoManager from './ApplicationDragoManager'
// import ApplicationDragoTrader from './ApplicationDragoTrader'
import Loading from '../_atomic/atoms/loading';
import styles from './applicationExchangeHome.module.css';
import {
  ERC20_TOKENS
} from '../_utils/const'
import { Row, Col, Grid } from 'react-flexbox-grid';
import PropTypes from 'prop-types';
import utils from '../_utils/utils'
import ElementNotificationsDrawer from '../Elements/elementNotificationsDrawer'
import CheckAuthPage from '../Elements/checkAuthPage'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import FundSelector from '../_atomic/molecules/fundSelector'
import TokenTradeSelector from '../_atomic/molecules/tokenTradeSelector'
// import DragoComingSoon from '../Elements/elementDragoComingSoon'
import TokenLiquidity from '../_atomic/atoms/tokenLiquidity'
import {
  UPDATE_SELECTED_FUND,
  UPDATE_TRANSACTIONS_DRAGO_MANAGER,
  UPDATE_TRADE_TOKENS_PAIR,
  CANCEL_SELECTED_ORDER,
  RELAY_OPEN_WEBSOCKET,
  RELAY_GET_ORDERS,
  ORDERBOOK_AGGREGATE_ORDERS
} from '../_utils/const'
import Paper from 'material-ui/Paper'
import { connect } from 'react-redux';
import OrderBook from '../_atomic/organisms/orderBook';
import OrderBox from '../_atomic/organisms/orderBox'
import Exchange from '../_utils/exchange'
import { getMarketTakerOrder, getAvailableAddresses } from '../_utils/exchange'
import FlatButton from 'material-ui/FlatButton'

function mapStateToProps(state) {
  return state
}

class ApplicationExchangeHome extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
    this.sourceLogClass = this.constructor.name
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    exchangeUtils: PropTypes.object
  };


  getChildContext() {
    return {
      exchangeUtils: this.state.exchangeUtils,
    };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    exchange: PropTypes.object.isRequired,
  };

  state = {
    exchangeUtils: {},
    orders: {
      bidsOrders: [],
      asksOrders: [],
    }
  }

  scrollPosition = 0
  activeElement = null

  updateTransactionsDragoAction = (results) => {
    return {
      type: UPDATE_TRANSACTIONS_DRAGO_MANAGER,
      payload: results
    }
  };

  updateSelectedFundDetails = (liquidity, fund) => {
    const payload = {
      details: fund,
      liquidity: {
        ETH: liquidity[0],
        WETH: liquidity[1],
        ZRX: liquidity[2]
      }
    }
    return {
      type: UPDATE_SELECTED_FUND,
      payload: payload
    }
  };

  updateSelectedTradeTokensPair = (tradeTokensPair) => {
    return {
      type: UPDATE_TRADE_TOKENS_PAIR,
      payload: tradeTokensPair
    }
  };

  setAggregateOrders = (isInputChecked) => {
    return {
      type: ORDERBOOK_AGGREGATE_ORDERS,
      payload: isInputChecked
    }
  };

  relayGetOrders = (filter) => {
    return {
      type: RELAY_GET_ORDERS,
      payload: filter
    }
  };


  shouldComponentUpdate(nextProps, nextState) {
    var stateUpdate = true
    var propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    stateUpdate = (!utils.shallowEqual(this.state.loading, nextState.loading))
    stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = this.node
    if (element != null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate
  }

  componentWillMount() {
  }

  componentDidMount() {
    const { accounts } = this.props.endpoint
    const { selectedTokensPair, selectedExchange  } = this.props.exchange
    this.getTransactions(null, accounts)
    // this.connectToRadarRelay()
    this.connectToExchange(selectedTokensPair)
    getAvailableAddresses(selectedExchange)
    .then (adreesses => {
      this.props.dispatch({ type: 'SET_MAKER_ADDRESS', payload: adreesses[0] })
    })
  }

  componentWillUnmount() {
  }

  componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate() {
    const element = this.node
    if (element != null) {
      window.scrollTo(0, this.scrollPosition)
    }
    // Setting focus on the element active before component re-render
    if (this.activeElement.id !== "") {
      const activeElement = document.getElementById(this.activeElement.id);
      if (activeElement != null) {
        activeElement.focus()
      }
    }
  }

  onToggleAggregateOrders = (isInputChecked) => {
    this.props.dispatch(this.setAggregateOrders(isInputChecked))
    const filter = {
      networkId: this.props.exchange.relay.networkId,
      baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
      quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address,
      aggregated: isInputChecked
    }
    this.props.dispatch(this.relayGetOrders(filter))
  }

  onSelectFund = (fund) => {
    const { api } = this.context
    utils.getDragoLiquidity(fund.address, api)
      .then(liquidity => {
        this.props.dispatch(this.updateSelectedFundDetails(liquidity, fund))
      })
  }

  onSelectTokenTrade = (token) => {
    const { ws } = this.state
    const { api } = this.context
    const baseToken = ERC20_TOKENS[api._rb.network.name][token]
    const tradeTokensPair = {
      baseToken: baseToken,
      quoteToken: {
        symbol: 'WETH',
        address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
        decimals: 18
      }
    }
    this.props.dispatch({
      type: CANCEL_SELECTED_ORDER,
    })
    this.props.dispatch(this.updateSelectedTradeTokensPair(tradeTokensPair))
    ws.close()
    this.connectToExchange(tradeTokensPair)
  }

  onButtonTest = () => {
    console.log('open')
    // this.props.dispatch({ type: 'PING', payload: 'resttter' })
    // this.props.dispatch({ type: RELAY_OPEN_WEBSOCKET, payload: { 
    //   url: 'wss://api.ercdex.com',
    //   baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
    //   quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address
    // }})
    var filter = {
      networkId: this.props.exchange.relay.networkId,
      baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
      quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address,
      aggregated: this.props.exchange.orderBook.aggregated
    }
    this.props.dispatch(this.relayGetOrders(filter))
    // this.props.dispatch({ type: 'RELAY_SUBSCRIBE_WEBSOCKET', payload: { sub: 'sub:ticker2' }})
  }

  onButtonTest2 = () => {
    console.log('subcribe')
    getMarketTakerOrder(
      this.props.exchange.selectedTokensPair.baseToken.address,
      this.props.exchange.selectedTokensPair.quoteToken.address,
      this.props.exchange.selectedTokensPair.baseToken.address,
      '95000000000000000000',
      this.props.exchange.relay.networkId,
      "0x57072759Ba54479669CAdF1A25528a472Af95cEF".toLowerCase()
    )
      .then(results => {
        console.log(results)
      })
    // this.props.dispatch({ type: 'PING', payload: 'resttter' })
    // this.props.dispatch({ type: 'RELAY_OPEN_WEBSOCKET', payload: { url: 'wss://api.ercdex.com'}})
    // this.props.dispatch({ type: 'RELAY_SUBSCRIBE_WEBSOCKET', payload: { sub: 'sub:ticker' }})
    // this.props.dispatch({ type: 'RELAY_SUBSCRIBE_WEBSOCKET', payload: { sub: 'sub:ticker2' }})
  }

  render() {
    const {
      user,
      location,
      handleToggleNotifications,
      notificationsOpen,
      endpoint,
      exchange
    } = this.props
    if (endpoint.loading) {
      return <Loading></Loading>
    }
    if ((endpoint.accounts.length === 0 || !endpoint.networkCorrect)) {
      return (
        <span>
          <CheckAuthPage warnMsg={endpoint.warnMsg} location={location} />
          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </span>
      )
    }

    if (user.isManager) {
      const { bids, asks, spread, aggregated } = this.props.exchange.orderBook
      const asksOrderNormalized = asks.slice(asks.length - 20, asks.length)
      const bidsOrderNormalized = bids.slice(bids.length - 20, bids.length)
      // console.log(this.props.exchange.selectedExchange)
      // const bidsOrderNormalizedFilled = [ ...Array(20 - bidsOrderNormalized.length).fill(null), ...bidsOrderNormalized ]
      // const asksOrderNormalizedFilled = [ ...Array(20 - asksOrderNormalized.length).fill(null), ...asksOrderNormalized]
      const selectedOrder = { ...exchange.selectedOrder }
      console.log(aggregated)
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <Row>
                  <Col xs={4}>
                    <FundSelector
                      funds={this.props.transactionsDrago.manager.list}
                      onSelectFund={this.onSelectFund} />
                  </Col>
                  <Col xs={2}>
                    <TokenLiquidity liquidity={exchange.selectedFund.liquidity} />
                  </Col>
                  <Col xs={4}>
                    <TokenTradeSelector
                      selectedTradeTokensPair={exchange.selectedTokensPair}
                      onSelectTokenTrade={this.onSelectTokenTrade}
                    />
                  </Col>
                </Row>
              </ Paper>
            </Col>
            <Col xs={12}>
              <Row>
                <Col xs={6}>
                  <OrderBox />
                  <Col xs={12}>
                    <FlatButton primary={true} label="Submit"
                      labelStyle={{ fontWeight: 700, fontSize: '18px' }}
                      onClick={this.onButtonTest}
                    />
                    <FlatButton primary={true} label="Submit2"
                      labelStyle={{ fontWeight: 700, fontSize: '18px' }}
                      onClick={this.onButtonTest2}
                    />
                  </Col>
                </Col>
                <Col xs={6}>
                  <OrderBook
                    bidsOrders={bidsOrderNormalized}
                    asksOrders={asksOrderNormalized}
                    spread={spread}
                    aggregated={aggregated}
                    onToggleAggregateOrders={this.onToggleAggregateOrders}
                  />
                  {/* <ElementListBids list={this.state.bidsList} /> */}
                </Col>

              </Row>
            </Col>

          </Row>
          <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer
                  handleToggleNotifications={handleToggleNotifications}
                  notificationsOpen={notificationsOpen}
                />
              ) : (
                  null
                )}
            </Col>
          </Row>

          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </div>
      );
    }

    if (!user.isManager) {
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              Only managers can access this section.
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer
                  handleToggleNotifications={handleToggleNotifications}
                  notificationsOpen={notificationsOpen}
                />
              ) : (
                  null
                )}
            </Col>
          </Row>
          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </div>
      );
    }
  }

  onNewEventZeroExExchange = (error, event) => {
    console.log(event)
  }

  connectToExchange = async (tradeTokensPair) => {
    console.log(tradeTokensPair)
    const { api } = this.context
    const networkInfo = api._rb.network
    const endpoints = this.props.endpoint.endpointInfo
    var exchangeUtils = new Exchange(endpoints, networkInfo, tradeTokensPair)
    var contract = exchangeUtils.init()
    const subscription = contract.events.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    }, this.onNewEventZeroExExchange)
    exchangeUtils.tradeTokensPair = tradeTokensPair

    this.setState({
      exchangeUtils: exchangeUtils,
      // orders: {
      //   bidsOrders: bidsOrders, 
      //   asksOrders: asksOrders
      // },
      // ws: ws
    })
  }

  // Getting last transactions
  getTransactions = (dragoAddress, accounts) => {
    const { api } = this.context
    // const options = {balance: false, supply: true}
    const options = { balance: false, supply: true, limit: 10, trader: false }
    utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      .then(results => {
        const createdLogs = results[1].filter(event => {
          return event.type !== 'BuyDrago' && event.type !== 'SellDrago'
        })
        results[1] = createdLogs
        this.props.dispatch(this.updateTransactionsDragoAction(results))
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        console.warn(error)
      })
  }

}

export default connect(mapStateToProps)(ApplicationExchangeHome)
