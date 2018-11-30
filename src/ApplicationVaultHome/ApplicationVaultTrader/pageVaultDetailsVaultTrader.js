import * as Colors from 'material-ui/styles/colors'
import { Actions } from '../../_redux/actions'
import { Col, Grid, Row } from 'react-flexbox-grid'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ENDPOINTS, PROD } from '../../_utils/const'
import { Link, withRouter } from 'react-router-dom'
import { Tab, Tabs } from 'material-ui/Tabs'
import { connect } from 'react-redux'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import ElementFeesBox from '../Elements/elementFeesBox'
import ElementFundNotFound from '../../Elements/elementFundNotFound'
import ElementListTransactions from '../Elements/elementListTransactions'
import ElementListWrapper from '../../Elements/elementListWrapper'
import ElementVaultActions from '../Elements/elementVaultActions'
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
import Web3 from 'web3'
import scrollToElement from 'scroll-to-element'
import styles from './pageVaultDetailsVaultTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageFundDetailsVaultTrader extends Component {
  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    transactionsVault: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    snackBar: false,
    snackBarMsg: '',
    openBuySellDialog: {
      open: false,
      action: 'deposit'
    }
  }

  componentDidMount = async () => {
    const { api } = this.context
    const dragoId = this.props.match.params.dragoid

    // Getting Drago details and transactions
    this.props.dispatch(
      Actions.drago.getPoolDetails(dragoId, api, { poolType: 'vault' })
    )
  }

  componentWillUnmount() {
    this.props.dispatch(Actions.tokens.priceTickersStop())
    this.props.dispatch(Actions.exchange.getPortfolioChartDataStop())
    this.props.dispatch(Actions.vault.updateSelectedVault({}, { reset: true }))
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   //
  //   let stateUpdate = true
  //   let propsUpdate = true
  //   // const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
  //   // const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
  //   stateUpdate = !utils.shallowEqual(this.state, nextState)
  //   propsUpdate = !utils.shallowEqual(this.props, nextProps)
  //   if (stateUpdate || propsUpdate) {
  //     // console.log(`${this.constructor.name} -> shouldComponentUpdate -> Proceedding with rendering.`);
  //   }
  //   return stateUpdate || propsUpdate
  // }

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
        onCopy={() => this.snackBar('Copied to clilpboard')}
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
        target="_blank"
        rel="noopener noreferrer"
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
    // console.log(this.props)
    const { user } = this.props
    const { accounts } = this.props.endpoint
    const { loading } = this.state
    const vaultDetails = this.props.transactionsVault.selectedVault.details
    const vaultTransactionsList = this.props.transactionsVault.selectedVault
      .transactions
    const tabButtons = {
      inkBarStyle: {
        margin: 'auto',
        width: 100,
        backgroundColor: 'white'
      },
      tabItemContainerStyle: {
        margin: 'auto',
        width: 200
      }
    }
    const columnsStyle = [
      styles.detailsTableCell,
      styles.detailsTableCell2,
      styles.detailsTableCell3
    ]
    const tableButtonsVaultAddress = [
      this.renderCopyButton(vaultDetails.address),
      this.renderEtherscanButton('address', vaultDetails.address)
    ]
    const tableButtonsVaultOwner = [
      this.renderCopyButton(vaultDetails.addressOwner),
      this.renderEtherscanButton('address', vaultDetails.addressOwner)
    ]
    const tableInfo = [
      ['Created', vaultDetails.created, ''],
      ['Symbol', vaultDetails.symbol, ''],
      ['Name', vaultDetails.name, ''],
      ['Address', vaultDetails.address, tableButtonsVaultAddress],
      ['Owner', vaultDetails.addressOwner, tableButtonsVaultOwner]
    ]

    // Waiting until getVaultDetails returns the drago details
    if (Object.keys(vaultDetails).length === 0) {
      return (
        <div style={{ paddingTop: '10px' }}>
          <Loading />
        </div>
      )
    }

    if (vaultDetails.address === '0x0000000000000000000000000000000000000000') {
      return <ElementFundNotFound />
    }

    // const holdingFadeStyle = styles.noFadeNewHolding
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.pageContainer}>
            <Paper zDepth={1}>
              <Sticky enabled={true} innerZ={1}>
                <FundHeader fundType="vault" fundDetails={vaultDetails} />
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
                        icon={<ActionList color={'#607D8B'} />}
                      />
                      {/* <Tab label="INSIGHT" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.InSight, { offset: -180, align: 'top', duration: 500 })}
                        icon={<ActionAssessment color={'#607D8B'} />}>
                      </Tab> */}
                      <Tab
                        label="LOGS"
                        className={styles.detailsTab}
                        onActive={() =>
                          scrollToElement('#transactions-section', {
                            offset: -165
                          })
                        }
                        icon={<ActionShowChart color={'#607D8B'} />}
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
                      <SectionHeader
                        titleText="SUMMARY"
                        textStyle={{ backgroundColor: Colors.blueGrey500 }}
                        fundType="vault"
                      />
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
                            amount={vaultDetails.totalSupply}
                            symbol={vaultDetails.symbol.toUpperCase()}
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
                                  amount={vaultDetails.balanceDRG}
                                  symbol={vaultDetails.symbol.toUpperCase()}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col xs={12}>
                            <SectionTitle titleText="FEES" help={true} />
                            <div className={styles.detailsBoxContainer}>
                              <Row>
                                <Col xs={12}>
                                  <div
                                    className={styles.sectionParagraph}
                                    style={{ paddingTop: '5px' }}
                                  >
                                    Manager set fees:
                                  </div>
                                </Col>
                              </Row>
                              <ElementFeesBox
                                vaultDetails={vaultDetails}
                                accounts={accounts}
                                handleBuySellButtons={this.handleBuySellButtons}
                                isManager={user.isManager}
                              />
                              <ElementVaultActions
                                vaultDetails={vaultDetails}
                                accounts={accounts}
                                snackBar={this.snackBar}
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
                      id="transactions-section"
                      ref={section => {
                        this.Logs = section
                      }}
                    />
                    <SectionHeader
                      titleText="LOGS"
                      textStyle={{ backgroundColor: Colors.blueGrey500 }}
                      fundType="vault"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className={styles.detailsTabContent}>
                    <SectionTitle titleText="TRANSACTIONS" />
                    <div className={styles.detailsTabContent}>
                      <p>Your last 20 transactions on this Vault.</p>
                    </div>
                    <ElementListWrapper
                      list={vaultTransactionsList}
                      renderCopyButton={this.renderCopyButton}
                      renderEtherscanButton={this.renderEtherscanButton}
                      loading={loading}
                      autoLoading={false}
                      renderOptimization={false}
                      pagination={{
                        display: 10,
                        number: 1
                      }}
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

  subscribeToEvents = contract => {
    const networkName = this.props.endpoint.networkInfo.name
    let WsSecureUrl = ''
    const eventfullContracAddress = contract.contract.address[0]
    if (PROD) {
      WsSecureUrl = ENDPOINTS.rigoblock.wss[networkName].prod
    } else {
      WsSecureUrl = ENDPOINTS.rigoblock.wss[networkName].dev
    }
    const web3 = new Web3(WsSecureUrl)
    const eventfullContract = new web3.eth.Contract(
      contract.abi,
      eventfullContracAddress
    )
    const subscription = eventfullContract.events.allEvents(
      {
        fromBlock: 'latest',
        topics: [null, null, null, null]
      },
      (error, events) => {
        if (!error) {
          console.log(`${this.constructor.name} -> New contract event.`)
          console.log(events)
          this.initVault()
        }
      }
    )
    this.setState({
      contractSubscription: subscription
    })
  }
}

export default withRouter(connect(mapStateToProps)(PageFundDetailsVaultTrader))
