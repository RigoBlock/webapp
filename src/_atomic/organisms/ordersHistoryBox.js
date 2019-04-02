import { Actions } from '../../_redux/actions'
import { Col, Grid, Row } from 'react-flexbox-grid'
import { cancelOrderFromRelayEFX } from '../../_utils/exchange'
// import {
//   cancelOrderOnExchangeViaProxy,
//   softCancelOrderFromRelayERCdEX
// } from '../../_utils/exchange'
import { connect } from 'react-redux'
import { notificationWrapper } from '../../_utils/notificationWrapper'
import { sha3_512 } from 'js-sha3'
import BoxTitle from '../atoms/boxTitle'
import ElementListWrapper from '../../Elements/elementListWrapper'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SectionTitleExchange from '../atoms/sectionTitleExchange'
import TableOpenOrders from '../molecules/tableOpenOrders'
import TableOrdersHistory from '../molecules/tableOrdersHistory'
import TableTradesHistory from '../molecules/tableTradesHistory'
import serializeError from 'serialize-error'
import styles from './ordersHistoryBox.module.css'
import utils from '../../_utils/utils'

function mapStateToProps(state) {
  return state
}

class OrdersHistoryBox extends Component {
  static propTypes = {
    exchange: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired
  }

  onCancelOrder = async order => {
    const { selectedFund, selectedTokensPair } = this.props.exchange
    const { endpoint } = this.props

    const transactionId = sha3_512(new Date() + selectedFund.managerAccount)
    let transactionDetails = {
      status: 'pending',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: selectedFund.details.address,
      error: false,
      action: 'ExCancelOrder',
      symbol: selectedTokensPair.baseToken.symbol.toUpperCase(),
      amount: order.orderAmount
    }
    try {

      const sig = await utils.sign(
        parseInt(order.order.id, 10).toString(16),
        this.props.exchange.walletAddress
      )

      /*let parsedBody =*/ await cancelOrderFromRelayEFX(
        order.order.id,
        sig,
        endpoint.networkInfo.id
      )
      transactionDetails.status = 'executed'
      transactionDetails.timestamp = new Date()
      this.props.dispatch(
        Actions.transactions.addTransactionToQueueAction(
          transactionId,
          transactionDetails
        )
      )

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
      const notificationEngine = notificationWrapper.getInstance()
      utils.notificationError(notificationEngine, serializeError(error).message)
    }
  }

  render() {
    const { ui, fundOrders, tradesHistory } = this.props.exchange
    const { networkInfo } = this.props.endpoint
    const paperStyle = {
      padding: '5px',
      display: ui.panels.ordersHistoryBox.expanded ? 'inline-block' : 'none'
    }
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'MY ORDERS'} boxName={'ordersHistoryBox'} />
              <Paper style={paperStyle} zDepth={1}>
                <Grid fluid>
                  <Row>
                    <Col xs={8}>
                      <div className={styles.section}>
                        <Row>
                          <Col xs={12} className={styles.title}>
                            <SectionTitleExchange titleText="OPEN ORDERS" />
                          </Col>
                          <Col xs={12}>
                            <ElementListWrapper
                              list={fundOrders.open}
                              autoLoading={false}
                              onCancelOrder={this.onCancelOrder}
                              pagination={{
                                display: 10,
                                number: 1
                              }}
                            >
                              <TableOpenOrders />
                            </ElementListWrapper>
                          </Col>

                          <Col xs={12} className={styles.title}>
                            <SectionTitleExchange titleText="ORDER HISTORY" />
                          </Col>
                          <Col xs={12}>
                            <ElementListWrapper
                              list={fundOrders.history}
                              autoLoading={false}
                              onCancelOrder={this.onCancelOrder}
                              pagination={{
                                display: 5,
                                number: 1
                              }}
                            >
                              <TableOrdersHistory />
                            </ElementListWrapper>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className={styles.sectionTrades}>
                        <Row>
                          <Col xs={12} className={styles.title}>
                            <SectionTitleExchange titleText="TRADES HISTORY" />
                          </Col>
                          <Col xs={12}>
                            <ElementListWrapper
                              list={tradesHistory}
                              autoLoading={false}
                              onCancelOrder={this.onCancelOrder}
                              pagination={{
                                display: 10,
                                number: 1
                              }}
                            >
                              <TableTradesHistory
                                networkName={networkInfo.name}
                              />
                            </ElementListWrapper>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default connect(mapStateToProps)(OrdersHistoryBox)
