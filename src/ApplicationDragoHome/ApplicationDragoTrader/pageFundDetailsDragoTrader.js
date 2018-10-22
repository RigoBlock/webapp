import { Actions } from '../../_redux/actions'
import { Col, Grid, Row } from 'react-flexbox-grid'
import { CopyToClipboard } from 'react-copy-to-clipboard'
// import { ENDPOINTS, Ethfinex, PROD } from '../../_utils/const'
import { Link, withRouter } from 'react-router-dom'
import { Tab, Tabs } from 'material-ui/Tabs'
import { connect } from 'react-redux'
// import { formatCoins, formatEth } from '../../_utils/format'
import { formatPrice } from '../../_utils/format'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import AssetChartPlotly from '../../_atomic/atoms/assetChartPlotly'
import AssetsPieChart from '../../_atomic/atoms/assetsPieChart'
import BigNumber from 'bignumber.js'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import ElementFundActions from '../Elements/elementFundActions'
import ElementFundNotFound from '../../Elements/elementFundNotFound'
import ElementListAssets from '../Elements/elementListAssets'
import ElementListTransactions from '../Elements/elementListTransactions'
import ElementListWrapper from '../../Elements/elementListWrapper'
import ElementPriceBox from '../Elements/elementPricesBox'
import FundHeader from '../../_atomic/molecules/fundHeader'
import InfoTable from '../../Elements/elementInfoTable'
import Loading from '../../_atomic/atoms/loading'
import Paper from 'material-ui/Paper'
import PoolHoldingSupply from '../../_atomic/molecules/poolHoldingSupply'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import SectionHeader from '../../_atomic/atoms/sectionHeader'
import SectionTitle from '../../_atomic/atoms/sectionTitle'
import Snackbar from 'material-ui/Snackbar'
import Sticky from 'react-stickynode'
import scrollToElement from 'scroll-to-element'
import styles from './pageFundDetailsDragoTrader.module.css'
import utils from '../../_utils/utils'
// import { Action } from '../../../node_modules/rxjs/internal/scheduler/Action';

function mapStateToProps(state) {
  return state
}

class PageFundDetailsDragoTrader extends Component {
  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    exchange: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    snackBar: false,
    snackBarMsg: '',
    openBuySellDialog: {
      open: false,
      action: 'buy'
    }
  }

  componentDidMount = async () => {
    const { api } = this.context
    const dragoId = this.props.match.params.dragoid

    // Getting Drago details and transactions
    this.props.dispatch(
      Actions.drago.getPoolDetails(dragoId, api, { poolType: 'drago' })
    )

    // Getting Drago assets
    // this.props.dispatch(
    //   Actions.drago.getTokenBalancesDrago(dragoDetails, api, relay)
    // )
  }

  componentWillUnmount() {
    this.props.dispatch(Actions.tokens.priceTickersStop())
    this.props.dispatch(Actions.exchange.getPortfolioChartDataStop())
    this.props.dispatch(Actions.drago.updateSelectedDrago({}, { reset: true }))
  }

  shouldComponentUpdate(nextProps, nextState) {
    //
    let stateUpdate = true
    let propsUpdate = true
    // const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    // const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    if (stateUpdate || propsUpdate) {
      // console.log(`${this.constructor.name} -> shouldComponentUpdate -> Proceedding with rendering.`);
    }
    return stateUpdate || propsUpdate
  }

  snackBar = msg => {
    this.setState({
      snackBar: true,
      snackBarMsg: msg
    })
  }

  renderCopyButton = text => {
    if (!text) {
      return null
    }

    return (
      <CopyToClipboard
        text={text}
        key={'address' + text}
        onCopy={() => this.snackBar('Copied to clipboard')}
      >
        <Link to={'#'} key={'addresslink' + text}>
          <CopyContent className={styles.copyAddress} />
        </Link>
      </CopyToClipboard>
    )
  }

  renderEtherscanButton = (type, text) => {
    if (!text) {
      return null
    }

    return (
      <a
        key={'addressether' + text}
        href={this.props.endpoint.networkInfo.etherscan + type + '/' + text}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Search className={styles.copyAddress} />
      </a>
    )
  }

  handlesnackBarRequestClose = () => {
    this.setState({
      snackBar: false,
      snackBarMsg: ''
    })
  }

  handleBuySellButtons = action => {
    this.setState({
      openBuySellDialog: {
        open: !this.state.openBuySellDialog.open,
        action: action
      }
    })
  }

  onTransactionSent = () => {
    this.setState({
      openBuySellDialog: {
        open: false
      }
    })
  }

  render() {
    const {
      endpoint: { accounts: accounts },
      user
    } = this.props
    // const { loading } = this.state
    const dragoAssetsList = this.props.transactionsDrago.selectedDrago.assets
    const assetsCharts = this.props.transactionsDrago.selectedDrago.assetsCharts
    const dragoDetails = this.props.transactionsDrago.selectedDrago.details
    const dragoValues = this.props.transactionsDrago.selectedDrago.values
    const dragoTransactionsList = this.props.transactionsDrago.selectedDrago
      .transactions
    const tabButtons = {
      inkBarStyle: {
        margin: 'auto',
        width: 100,
        backgroundColor: 'white'
      },
      tabItemContainerStyle: {
        margin: 'auto',
        width: 300
      }
    }
    const columnsStyle = [
      styles.detailsTableCell,
      styles.detailsTableCell2,
      styles.detailsTableCell3
    ]
    const columnsStyleLiquidityTable = [
      styles.detailsTableCellLiquidity,
      styles.detailsTableCellLiquidity2,
      styles.detailsTableCellLiquidity3
    ]
    const tableButtonsDragoAddress = [
      this.renderCopyButton(dragoDetails.address),
      this.renderEtherscanButton('address', dragoDetails.address)
    ]
    const tableButtonsDragoOwner = [
      this.renderCopyButton(dragoDetails.addressOwner),
      this.renderEtherscanButton('address', dragoDetails.addressOwner)
    ]
    const tableInfo = [
      ['Created', dragoDetails.created, ''],
      ['Symbol', dragoDetails.symbol, ''],
      ['Name', dragoDetails.name, ''],
      ['Address', dragoDetails.address, tableButtonsDragoAddress],
      ['Manager', dragoDetails.addressOwner, tableButtonsDragoOwner]
    ]

    let totalAssetsValue = 0
    let assetsValues = {}
    let tableLiquidity = [
      ['Liquidity', 'Calculating...', [<small key="dragoLiqEth">ETH</small>]],
      [
        'Porfolio value',
        'Calculating...',
        [<small key="dragoPortEth">ETH</small>]
      ],
      ['Total', 'Calculating...', [<small key="dragoPortTotEth">ETH</small>]]
    ]

    // Show pool balance
    if (typeof dragoDetails.dragoETHBalance !== 'undefined') {
      totalAssetsValue = dragoDetails.dragoETHBalance
      tableLiquidity[0] = [
        'Liquidity',
        formatPrice(dragoDetails.dragoETHBalance),
        <small key="dragoLiqEth">ETH</small>
      ]

      tableLiquidity[2] = [
        'Total',
        formatPrice(totalAssetsValue),
        [<small key="dragoPortTotEth">ETH</small>]
      ]
    }

    // Show portfolio value
    if (dragoValues.portfolioValue !== -1) {
      totalAssetsValue = new BigNumber(dragoDetails.dragoETHBalance)
        .plus(dragoValues.portfolioValue)
        .toFixed(4)
      tableLiquidity[1] = [
        'Porfolio value',
        formatPrice(dragoValues.portfolioValue),
        [<small key="dragoPortEth">ETH</small>]
      ]
      if (!Number(totalAssetsValue)) {
        totalAssetsValue = dragoDetails.dragoETHBalance
      }
      tableLiquidity[2] = [
        'Total',
        formatPrice(totalAssetsValue),
        [<small key="dragoPortTotEth">ETH</small>]
      ]
      assetsValues = utils.calculatePieChartPortfolioValue(
        dragoAssetsList,
        this.props.exchange.prices.current,
        dragoDetails.dragoETHBalance
      )
    }

    // Show estimated prices
    let estimatedPrice = 'N/A'
    if (dragoValues.estimatedPrice !== -1) {
      estimatedPrice = formatPrice(dragoValues.estimatedPrice)
    }

    // Waiting until getDragoDetails returns the drago details
    if (Object.keys(dragoDetails).length === 0) {
      return (
        <div style={{ paddingTop: '10px' }}>
          <Loading />
        </div>
      )
    }
    if (dragoDetails.address === '0x0000000000000000000000000000000000000000') {
      return <ElementFundNotFound />
    }

    return (
      <Row>
        <Col xs={12}>
          <div className={styles.pageContainer} key={dragoDetails.dragoId}>
            <Paper zDepth={1}>
              <Sticky enabled={true} innerZ={1}>
                <FundHeader fundType="drago" fundDetails={dragoDetails} />
                <Row className={styles.tabsRow}>
                  <Col xs={12}>
                    <Tabs
                      tabItemContainerStyle={tabButtons.tabItemContainerStyle}
                      inkBarStyle={tabButtons.inkBarStyle}
                    >
                      <Tab
                        label="SUMMARY"
                        className={styles.detailsTab}
                        onActive={() =>
                          scrollToElement('#summary-section', { offset: -165 })
                        }
                        icon={<ActionList color={'#054186'} />}
                      />
                      <Tab
                        label="INSIGHT"
                        className={styles.detailsTab}
                        onActive={() =>
                          scrollToElement('#insight-section', { offset: -165 })
                        }
                        icon={<ActionAssessment color={'#054186'} />}
                      />
                      <Tab
                        label="LOGS"
                        className={styles.detailsTab}
                        onActive={() =>
                          scrollToElement('#transactions-section', {
                            offset: -165
                          })
                        }
                        icon={<ActionShowChart color={'#054186'} />}
                      />
                    </Tabs>
                  </Col>
                </Row>
              </Sticky>
            </Paper>
            <Paper className={styles.paperContainer} zDepth={1}>
              <div className={styles.detailsBoxContainer}>
                <Grid fluid>
                  <Row>
                    <Col xs={12}>
                      <span
                        id="summary-section"
                        ref={section => {
                          this.Summary = section
                        }}
                      />
                      <SectionHeader titleText="SUMMARY" />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <SectionTitle titleText="DETAILS" />
                      <div className={styles.detailsContent}>
                        <div className={styles.sectionParagraph}>
                          Total supply:
                        </div>
                        <div className={styles.holdings}>
                          <PoolHoldingSupply
                            amount={dragoDetails.totalSupply}
                            symbol={dragoDetails.symbol.toUpperCase()}
                          />
                        </div>
                        <InfoTable
                          rows={tableInfo}
                          columnsStyle={columnsStyle}
                        />
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className={styles.myPositionBox}>
                        <Row>
                          <Col xs={12}>
                            <SectionTitle titleText="POSITION" help={true} />
                            <div className={styles.detailsBoxContainer}>
                              <div className={styles.sectionParagraph}>
                                Your total holding:
                              </div>
                              <div className={styles.holdings}>
                                <PoolHoldingSupply
                                  amount={dragoDetails.balanceDRG}
                                  symbol={dragoDetails.symbol.toUpperCase()}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col xs={12}>
                            <SectionTitle titleText="MARKET" help={true} />
                            <div className={styles.detailsBoxContainer}>
                              <Row>
                                <Col xs={6}>
                                  <div className={styles.sectionParagraph}>
                                    Estimated price:
                                  </div>
                                </Col>
                                <Col xs={6} style={{ textAlign: 'center' }}>
                                  {estimatedPrice} <small>ETH</small>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12}>
                                  <div
                                    className={styles.sectionParagraph}
                                    style={{ paddingTop: '5px' }}
                                  >
                                    Manager set price:
                                  </div>
                                </Col>
                              </Row>
                              <ElementPriceBox
                                dragoDetails={dragoDetails}
                                accounts={accounts}
                                handleBuySellButtons={this.handleBuySellButtons}
                                isManager={user.isManager}
                              />
                              <ElementFundActions
                                dragoDetails={dragoDetails}
                                accounts={accounts}
                                actionSelected={this.state.openBuySellDialog}
                                onTransactionSent={this.onTransactionSent}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </div>
            </Paper>
            <Paper className={styles.paperContainer} zDepth={1}>
              <Grid fluid>
                <Row>
                  <Col xs={12}>
                    <span
                      id="insight-section"
                      ref={section => {
                        this.InSight = section
                      }}
                    />
                    <SectionHeader titleText="INSIGHT" />
                  </Col>
                </Row>
                {/* <div>
                  {Object.keys(assetsCharts).length !== 0 && (
                    <AssetChartPlotly data={assetsCharts} />
                  )}
                </div> */}
                <Row>
                  <Col xs={12}>
                    <div className={styles.detailsBoxContainer}>
                      <div className={styles.detailsSectionContainer}>
                        <SectionTitle titleText="ASSETS" />
                        <Row>
                          <Col xs={12}>
                            <Row>
                              <Col xs={6}>
                                <InfoTable
                                  rows={tableLiquidity}
                                  columnsStyle={columnsStyleLiquidityTable}
                                />
                              </Col>
                              <Col xs={6}>
                                <AssetsPieChart data={assetsValues} />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                      <SectionTitle titleText="PORTFOLIO" />
                      <div className={styles.sectionParagraph}>
                        Assets in porfolio:
                      </div>
                      <ElementListWrapper
                        list={dragoAssetsList}
                        renderCopyButton={this.renderCopyButton}
                        renderEtherscanButton={this.renderEtherscanButton}
                        dragoDetails={dragoDetails}
                        autoLoading={false}
                        assetsPrices={this.props.exchange.prices.current}
                        assetsChart={assetsCharts}
                        renderOptimization={false}
                        pagination={{
                          display: 4,
                          number: 1
                        }}
                      >
                        <ElementListAssets />
                      </ElementListWrapper>
                    </div>
                  </Col>
                </Row>
              </Grid>
            </Paper>
            <Paper className={styles.paperContainer} zDepth={1}>
              <Grid fluid>
                <Row>
                  <Col xs={12}>
                    <span
                      id="transactions-section"
                      ref={section => {
                        this.Logs = section
                      }}
                    />
                    <SectionHeader titleText="LOGS" />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className={styles.detailsTabContent}>
                    <SectionTitle titleText="TRANSACTIONS" />
                    <div className={styles.detailsTabContent}>
                      <p>Your last 20 transactions on this fund.</p>
                    </div>
                    <ElementListWrapper
                      list={dragoTransactionsList}
                      renderCopyButton={this.renderCopyButton}
                      renderEtherscanButton={this.renderEtherscanButton}
                      autoLoading={false}
                    >
                      <ElementListTransactions />
                    </ElementListWrapper>
                  </Col>
                </Row>
              </Grid>
            </Paper>
          </div>
        </Col>
        <Snackbar
          open={this.state.snackBar}
          message={this.state.snackBarMsg}
          action="close"
          onActionClick={this.handlesnackBarRequestClose}
          onRequestClose={this.handlesnackBarRequestClose}
          bodyStyle={{
            height: 'auto',
            flexGrow: 0,
            paddingTop: '10px',
            lineHeight: '20px',
            borderRadius: '2px 2px 0px 0px',
            backgroundColor: '#fafafa',
            boxShadow: '#bdbdbd 0px 0px 5px 0px'
          }}
          contentStyle={{
            color: '#000000 !important',
            fontWeight: '600'
          }}
        />
      </Row>
    )
  }
}
export default withRouter(connect(mapStateToProps)(PageFundDetailsDragoTrader))
