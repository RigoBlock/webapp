import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {Tabs, Tab} from 'material-ui/Tabs'
import {Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import AppBar from 'material-ui/AppBar';
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'
import { formatCoins, formatEth } from '../../_utils/format'
import PoolApi from '../../PoolsApi/src'
import ElementVaultActionsList from '../Elements/elementVaultActionsList'
import ElementListTransactions from '../Elements/elementListTransactions'
import ElementListWrapper from '../../Elements/elementListWrapper'
import ElementFeesBox from '../Elements/elementFeesBox'
import IdentityIcon from '../../_atomic/atoms/identityIcon'
import InfoTable from '../../Elements/elementInfoTable'
import Loading from '../../_atomic/atoms/loading'
import utils from '../../_utils/utils'
import styles from './pageVaultDetailsVaultManager.module.css';
import ElementFundNotFound from '../../Elements/elementFundNotFound'
import ElementNoAdminAccess from '../../Elements/elementNoAdminAccess'
import BigNumber from 'bignumber.js';
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return state
}


class PageVaultDetailsVaultManager extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
      location: PropTypes.object.isRequired,
      endpoint: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      match: PropTypes.object.isRequired, 
      isManager: PropTypes.bool.isRequired
    };

    state = {
      vaultDetails: {
        address: null,
        name: null,
        symbol: null,
        dragoId: null,
        addresssOwner: null,
        addressGroup: null,
      },
      vaultTransactionsLogs: [],
      loading: true,
      snackBar: false,
      snackBarMsg: '',
    }

    subTitle = (account) => {
      return (
        account.address
      )     
    }

    componentWillMount () {
      // Getting dragoid from the url parameters passed by router and then
      // the list of last transactions
      const dragoId = this.props.match.params.dragoid
      this.getVaultDetails(dragoId)
    }

    componentWillReceiveProps(nextProps) {
      // Updating the lists on each new block if the accounts balances have changed
      // Doing this this to improve performances by avoiding useless re-rendering
      const dragoId = this.props.match.params.dragoid
      const sourceLogClass = this.constructor.name
      // console.log(nextProps)
      const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
      const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
      if (!currentBalance.eq(nextBalance)) {
        this.getVaultDetails(dragoId)
        console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
      } else {
        null
      }
    }

    shouldComponentUpdate(nextProps, nextState){
      const  sourceLogClass = this.constructor.name
      var stateUpdate = true
      var propsUpdate = true
      console.log(this.props)
      const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
      const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
      stateUpdate = !utils.shallowEqual(this.state, nextState)
      propsUpdate = !currentBalance.eq(nextBalance)
      if (stateUpdate || propsUpdate) {
        console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
      }
      return stateUpdate || propsUpdate
    }


    renderAddress (vaultDetails) {
      if (!vaultDetails.address ) {
        return <p>empty</p>;
      }
  
      return (
        <Row className={styles.detailsToolbarGroup}>
          <Col xs={12} md={1} className={styles.dragoTitle}>
            <h2 ><IdentityIcon address={ vaultDetails.address } /></h2>
          </Col>
          <Col xs={12} md={11} className={styles.dragoTitle}>
          <p>{vaultDetails.symbol} | {vaultDetails.name} </p>
          <small>{vaultDetails.address}</small>
          </Col>
        </Row>
      );
    }

    snackBar = (msg) =>{
      this.setState({
        snackBar: true,
        snackBarMsg: msg
      })
    }

    renderCopyButton = (text) =>{
      if (!text ) {
        return null;
      }
      
      return (
        <CopyToClipboard text={text} key={"address"+text}
            onCopy={() => this.snackBar('Copied to clilpboard')}>
            <Link to={'#'} key={"addresslink"+text}><CopyContent className={styles.copyAddress}/></Link>
        </CopyToClipboard>
      );
    }

    renderEtherscanButton = (type, text) =>{
      if (!text ) {
        return null;
      }
      
      return (
      <a key={"addressether"+text} href={this.props.endpoint.networkInfo.etherscan+type+'/' + text} target='_blank'><Search className={styles.copyAddress}/></a>
      );
    }

    handlesnackBarRequestClose = () => {
      this.setState({
        snackBar: false,
        snackBarMsg: ''
      })
    }


    
    render() {
      const { accounts, isManager, endpoint } = this.props
      const { vaultDetails, loading } = this.state
      const tabButtons = {
        inkBarStyle: {
          margin: 'auto',
          width: 100,
          backgroundColor: 'white'
          },
        tabItemContainerStyle: {
          margin: 'auto',
          width: 200,
        }
      }

      const columnsStyle = [styles.detailsTableCell, styles.detailsTableCell2, styles.detailsTableCell3]
      const tableButtonsVaultAddress = [this.renderCopyButton(vaultDetails.address), this.renderEtherscanButton('address', vaultDetails.address)]
      const tableButtonsVaultOwner = [this.renderCopyButton(vaultDetails.addresssOwner), this.renderEtherscanButton('address', vaultDetails.addresssOwner)]
      const tableInfo = [['Symbol', vaultDetails.symbol, ''], 
        ['Name', vaultDetails.name, ''], 
        ['Address', vaultDetails.address, tableButtonsVaultAddress],
        ['Owner', vaultDetails.addresssOwner, tableButtonsVaultOwner]]
      
        const paperStyle = {

      };
      var vaultTransactionList = this.state.vaultTransactionsLogs
      // console.log(vaultTransactionList)

      // Waiting until getVaultDetails returns the drago details
      if (loading) {
        return (
          <Loading />
        );
      }
      if (vaultDetails.address === '0x0000000000000000000000000000000000000000') {
        return (
          <ElementFundNotFound />
        );
      }

      // Checking if the user is the account manager
      let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
        return (account.address === vaultDetails.addresssOwner)
      });
      if (metaMaskAccountIndex === -1) {
        return (
          <ElementNoAdminAccess />
        )
      }

      return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
              <ToolbarGroup className={styles.detailsToolbarGroup}>
                {this.renderAddress(vaultDetails)}
              </ToolbarGroup>
              <ToolbarGroup>
                <ElementVaultActionsList accounts={accounts} vaultDetails={vaultDetails} snackBar={this.snackBar}/>
              </ToolbarGroup>
            </Toolbar>
            <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle} className={styles.test}>
              <Tab label="Info" className={styles.detailsTab}
                icon={<ActionList color={Colors.indigo500} />}>
                <Grid fluid>
                  <Row>
                    <Col xs={6}>
                      <Paper zDepth={1}>
                        <AppBar
                          title="DETAILS"
                          showMenuIconButton={false}
                          titleStyle={{ fontSize: 20 }}
                        />
                        <div className={styles.detailsTabContent}>
                        <InfoTable  rows={tableInfo} columnsStyle={columnsStyle}/>
                        </div>
                      </Paper>
                    </Col>
                    <Col xs={6}>
                      <Paper zDepth={1}>
                        <ElementFeesBox 
                        accounts={accounts} 
                        isManager={isManager}
                        vaultDetails={vaultDetails} />
                      </Paper>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} className={styles.detailsTabContent}>
                    <Paper style={paperStyle} zDepth={1} >
                    <AppBar
                          title="LAST TRANSACTIONS"
                          showMenuIconButton={false}
                          titleStyle={{ fontSize: 20 }}
                        />
                      
                      <div className={styles.detailsTabContent}>
                          <p>Your last 20 transactions on this Drago.</p>
                        </div>
                          <ElementListWrapper list={vaultTransactionList}
                              renderCopyButton={this.renderCopyButton}
                              renderEtherscanButton={this.renderEtherscanButton}
                              loading={loading}
                              >
                            <ElementListTransactions  />
                          </ElementListWrapper>
                        {/* <ElementListTransactions accountsInfo={accountsInfo} list={vaultTransactionList} 
                        renderCopyButton={this.renderCopyButton}
                        renderEtherscanButton={this.renderEtherscanButton}/> */}
                      </Paper>
                    </Col>
                  </Row>
                </Grid>
              </Tab>
              <Tab label="Stats" className={styles.detailsTab}
                icon={<ActionAssessment color={Colors.indigo500} />}>
                <Grid fluid>
                  <Row>
                    <Col xs={12} className={styles.detailsTabContent}>
                      <p>
                        Stats
                      </p>   
                    </Col>
                  </Row>
                </Grid>
              </Tab>
            </Tabs>
          </Paper>
        </Col>
        <Snackbar
          open={this.state.snackBar}
          message={this.state.snackBarMsg}
          action="close"
          onActionTouchTap={this.handlesnackBarRequestClose}
          onRequestClose={this.handlesnackBarRequestClose}
          bodyStyle={{
            height: "auto",
            flexGrow: 0,
            paddingTop: "10px",
            lineHeight: "20px",
            borderRadius: "2px 2px 0px 0px",
            backgroundColor: "#fafafa",
            boxShadow: "#bdbdbd 0px 0px 5px 0px"
          }}
          contentStyle={{
            color: "#000000 !important",
            fontWeight: "600"
          }}
        />
      </Row>
      )
    }

  // Getting the vault details from vaultId
  getVaultDetails = (vaultId) => {
    const { api } = this.context
    const { accounts } = this.props
    //
    // Initializing Drago API
    // Passing Parity API
    //      
    const poolApi = new PoolApi(api)
    //
    // Initializing registry contract
    //
    poolApi.contract.dragoregistry
      .init()
      .then(() => {
        //
        // Looking for drago from vaultId
        //
        poolApi.contract.dragoregistry
          .fromId(vaultId)
          .then((vaultDetails) => {
            const vaultAddress = vaultDetails[0][0]
            //
            // Initializing vault contract
            //
            console.log(vaultDetails)
            poolApi.contract.vault.init(vaultAddress)
            //
            // Calling getPrice method
            //
            poolApi.contract.vault.getAdminData()
              .then((data) => {
                const price = (new BigNumber(data[4]).div(100).toFixed(2))
                console.log(data[4])
                this.setState({
                  vaultDetails: {
                    address: vaultDetails[0][0],
                    name: vaultDetails[0][1].charAt(0).toUpperCase() + vaultDetails[0][1].slice(1),
                    symbol: vaultDetails[0][2].toUpperCase(),
                    vaultId: vaultDetails[0][3].c[0],
                    addresssOwner: vaultDetails[0][4],
                    addressGroup: vaultDetails[0][5],
                    sellPrice: 1,
                    buyPrice: 1,
                    price: price,
                  },
                  loading: false
                })
              })
            poolApi.contract.vaulteventful.init()
              .then(() => {
                this.getTransactions(vaultDetails[0][0], poolApi.contract.vaulteventful, accounts)
              }
              )
            // this.getTransactions (vaultDetails[0][0], contract, accounts)
          })
      })

  }  

   // Getting last transactions
   getTransactions = (vaultAddress, contract, accounts) => {
    const { api } = this.context
    var sourceLogClass = this.constructor.name
    console.log(vaultAddress)
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      var ethvalue = (log.event === 'SellVault') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
      var drgvalue = (log.event === 'SellVault') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
      // let ethvalue = null
      // let drgvalue = null     
      // if ((log.event === 'BuyDrago')) {
      //   ethvalue = formatEth(params.amount.value,null,api)
      //   drgvalue = formatCoins(params.revenue.value,null,api)     
      // }
      // if ((log.event === 'SellDrago')) {
      //   ethvalue = formatEth(params.revenue.value,null,api)
      //   drgvalue = formatCoins(params.amount.value,null,api)     
      // }
      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        key,
        ethvalue,
        drgvalue,
        symbol: String.fromCharCode(...params.symbol.value)
      }
    }

    // Getting all buyDrago and selDrago events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

    // The second param of the topics array is the drago address
    // The third param of the topics array is the from address
    // The third param of the topics array is the to address
    //
    //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

    const hexVaultAddress = vaultAddress
    const hexAccounts = accounts.map((account) => {
      const hexAccount = account.address
      return hexAccount
    })
    // const options = {
    //   fromBlock: 0,
    //   toBlock: 'pending',
    // }
    console.log(contract)
    const eventsFilterBuy = {
      topics: [
        [contract.hexSignature.BuyVault],
        [hexVaultAddress],
        hexAccounts,
        null
      ]
    }
    const eventsFilterSell = {
      topics: [
        [contract.hexSignature.SellVault],
        [hexVaultAddress],
        hexAccounts,
        null
      ]
    }
    const buyVaultEvents = contract
      .getAllLogs(eventsFilterBuy)
      .then((vaultTransactionsLog) => {
        console.log(vaultTransactionsLog)
        const buyLogs = vaultTransactionsLog.map(logToEvent)
        return buyLogs
      }
      )
    const sellVaultEvents = contract
      .getAllLogs(eventsFilterSell)
      .then((vaultTransactionsLog) => {
        const sellLogs = vaultTransactionsLog.map(logToEvent)
        return sellLogs
      }
      )
    Promise.all([buyVaultEvents, sellVaultEvents])
      .then((logs) => {
        const allLogs = [...logs[0], ...logs[1]]
        return allLogs
      })
      .then((vaultTransactionsLog) => {
        console.log(vaultTransactionsLog)
        // Creating an array of promises that will be executed to add timestamp to each entry
        // Doing so because for each entry we need to make an async call to the client
        // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
        var promises = vaultTransactionsLog.map((log) => {
          return api.eth
            .getBlockByNumber(log.blockNumber.c[0])
            .then((block) => {
              log.timestamp = block.timestamp
              return log
            })
            .catch((error) => {
              // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
              // other issues in the app.
              console.warn(error)
              log.timestamp = new Date()
              return log
            })
        })
        Promise.all(promises).then((results) => {
          this.setState({
            vaultTransactionsLogs: results,
            loading: false,
          })
        })
          .then(() => {
            console.log(`${sourceLogClass} -> Transactions list loaded`);
            this.setState({
              loading: false,
            })
          })
      })
  }
    
  }

  export default withRouter(connect(mapStateToProps)(PageVaultDetailsVaultManager))