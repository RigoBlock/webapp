import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Link, Route, withRouter } from 'react-router-dom'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {List, ListItem} from 'material-ui/List'
import {Tabs, Tab} from 'material-ui/Tabs'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import Avatar from 'material-ui/Avatar'
import BigNumber from 'bignumber.js';
import Chip from 'material-ui/Chip'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import DropDownMenu from 'material-ui/DropDownMenu'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import Immutable from 'immutable'
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import RaisedButton from 'material-ui/RaisedButton'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'

import { dragoFactoryEventsSignatures } from '../../utils/utils.js'
import { formatCoins, formatEth, formatHash, toHex } from '../../format'
import * as abis from '../../contracts';
import ElementListWrapper from '../../Elements/elementListWrapper'

// import ElementFundActions from '../Elements/elementFundActions'
import IdentityIcon from '../../IdentityIcon'
import InfoTable from '../../Elements/elementInfoTable'
import Loading from '../../Loading'
import DragoApi from '../../DragoApi/src'
import AppBar from 'material-ui/AppBar';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import ElementListTransactions from '../Elements/elementListTransactions'
import ElementFeesBox from '../Elements/elementFeesBox'
import utils from '../../utils/utils'
import ElementFundNotFound from '../../Elements/elementFundNotFound'
import ElementVaultActions from '../Elements/elementVaultActions'

import styles from './pageVaultDetailsVaultTrader.module.css';

class PageFundDetailsVaultTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      accountsInfo: PropTypes.object.isRequired, 
      isManager: PropTypes.bool.isRequired
    };

    state = {
      vaultDetails: {
        address: null,
        name: null,
        symbol: null,
        dragoID: null,
        addresssOwner: null,
        addressGroup: null,
      },
      vaultTransactionsLogs: null,
      loading: true,
      snackBar: false,
      snackBarMsg: '',
      openBuySellDialog: {
        open: false,
        action: 'deposit'
      }
    }



    subTitle = (account) => {
      return (
        account.address
      )     
    }

    componentWillMount () {
      // Getting dragoid from the url parameters passed by router and then
      // the list of last transactions
      const dragoID = this.props.match.params.dragoid
      this.getVaultDetails(dragoID)
    }

    componentWillReceiveProps(nextProps) {
      // Updating the lists on each new block if the accounts balances have changed
      // Doing this this to improve performances by avoiding useless re-rendering
      const { api } = this.context
      const dragoID = this.props.match.params.dragoid
      const {accounts } = this.props
      const sourceLogClass = this.constructor.name
      if (!this.props.ethBalance.eq(nextProps.ethBalance)) {
        this.getVaultDetails(dragoID)
        console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
      } else {
        null
      }
    }

    shouldComponentUpdate(nextProps, nextState){
      const  sourceLogClass = this.constructor.name
      var stateUpdate = true
      var propsUpdate = true
      stateUpdate = !utils.shallowEqual(this.state, nextState)
      propsUpdate = !this.props.ethBalance.eq(nextProps.ethBalance)
      if (stateUpdate || propsUpdate) {
        console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
      }
      return stateUpdate || propsUpdate
    }

    componentDidUpdate(nextProps) {
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
      <a key={"addressether"+text} href={'https://kovan.etherscan.io/'+type+'/' + text} target='_blank'><Search className={styles.copyAddress}/></a>
      );
    }

    handlesnackBarRequestClose = () => {
      this.setState({
        snackBar: false,
        snackBarMsg: ''
      })
    }

    handleBuySellButtons = (action) =>{
      console.log(action)
      this.setState({
        openBuySellDialog: {
          open: !this.state.openBuySellDialog.open,
          action: action
        }
      })
    }

    onTransactionSent = () =>{
      this.setState({
        openBuySellDialog: {
          open: false,
        }
      })
    }

    render() {
      const { location, accounts, accountsInfo, allEvents, isManager } = this.props
      const { vaultDetails, vaultTransactionsLogs, loading } = this.state
      const paperContainer = {
        marginTop: 10,
        display: 'inline-block',
      };
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
      const detailsBox = {
        padding: 20,
      }

      const columnsStyle = [styles.detailsTableCell, styles.detailsTableCell2, styles.detailsTableCell3]
      const tableButtonsVaultAddress = [this.renderCopyButton(vaultDetails.address), this.renderEtherscanButton('address', vaultDetails.address)]
      const tableButtonsVaultOwner = [this.renderCopyButton(vaultDetails.addresssOwner), this.renderEtherscanButton('address', vaultDetails.addresssOwner)]
      const tableInfo = [['Symbol', vaultDetails.symbol, ''], 
        ['Name', vaultDetails.name, ''], 
        ['Address', vaultDetails.address, tableButtonsVaultAddress],
        ['Owner', vaultDetails.addresssOwner, tableButtonsVaultOwner]]
      const paperStyle = {
        marginTop: "10px"
      };
      
      const web3 = window.web3

      var dragoTransactionList = this.state.vaultTransactionsLogs
      // console.log(dragoTransactionList)

      console.log(isManager)

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
      return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
              <ToolbarGroup className={styles.detailsToolbarGroup}>
                {this.renderAddress(vaultDetails)}
              </ToolbarGroup>
              <ToolbarGroup>
                {/* <ElementFundActions vaultDetails={vaultDetails} accounts={accounts} snackBar={this.snackBar}/> */}
              </ToolbarGroup>
            </Toolbar>
            <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle} className={styles.test}>
              <Tab label="Info" className={styles.detailsTab}
                icon={<ActionList color={Colors.blue500} />}>
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
                        vaultDetails={vaultDetails} 
                        accounts={accounts} 
                        handleBuySellButtons={this.handleBuySellButtons} 
                        isManager={isManager}
                        />
                        <ElementVaultActions 
                          vaultDetails={vaultDetails} 
                          accounts={accounts} 
                          snackBar={this.snackBar} 
                          actionSelected={this.state.openBuySellDialog}
                          onTransactionSent={this.onTransactionSent}
                          />
                        {/* <ElementFundActions 
                          vaultDetails={vaultDetails} 
                          accounts={accounts} 
                          snackBar={this.snackBar} 
                          actionSelected={this.state.openBuySellDialog}
                          onTransactionSent={this.onTransactionSent}
                          /> */}
                        {/* {this.state.openBuySellDialog.open
                          ? <ElementFundActions 
                          vaultDetails={vaultDetails} 
                          accounts={accounts} 
                          snackBar={this.snackBar} 
                          actionSelected={this.state.openBuySellDialog}/>
                          : null
                        } */}
                        {/* <div className={styles.tradeButton}>
                          <ElementFundActions vaultDetails={vaultDetails} accounts={accounts} snackBar={this.snackBar} />
                        </div> */}
                      </Paper>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} className={styles.detailsTabContent}>
                      <Paper style={paperStyle} zDepth={1} >
                        <AppBar
                          title="TRANSACTIONS"
                          showMenuIconButton={false}
                          titleStyle={{ fontSize: 20 }}
                        />
                        <div className={styles.detailsTabContent}>
                          <p>Your last 20 transactions on this fund.</p>
                        </div>


                        <ElementListWrapper accountsInfo={accountsInfo} list={dragoTransactionList}
                          renderCopyButton={this.renderCopyButton}
                          renderEtherscanButton={this.renderEtherscanButton}>

                          <ElementListTransactions />
                        </ElementListWrapper>
                      </Paper>
                    </Col>
                  </Row>
                </Grid>
              </Tab>
              <Tab label="Stats" className={styles.detailsTab}
                icon={<ActionAssessment color={Colors.blue500} />}>
                <Grid fluid>
                  <Row>
                    <Col xs={12} className={styles.detailsTabContent}>
                      <p>
                        Coming soon
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
        />
      </Row>
      )
    }

  // Getting the vault details from dragoID
  getVaultDetails = (dragoID) => {
    const { api } = this.context
    const { accounts } = this.props
    var sourceLogClass = this.constructor.name
    //
    // Initializing Drago API
    // Passing Parity API
    //      
    const dragoApi = new DragoApi(api)
    //
    // Initializing registry contract
    //
    dragoApi.contract.dragoregistry
      .init()
      .then((address) => {
        //
        // Looking for drago from dragoID
        //
        dragoApi.contract.dragoregistry
          .drago(dragoID)
          .then((vaultDetails) => {
            const vaultAddress = vaultDetails[0][0]
            //
            // Initializing vault contract
            //
            dragoApi.contract.vault.init(vaultAddress)
            //
            // Calling getPrice method
            //
            dragoApi.contract.vault.getTransactionFee()
              .then((data) => {
                this.setState({
                  vaultDetails: {
                    address: vaultDetails[0][0],
                    name: vaultDetails[0][1].charAt(0).toUpperCase() + vaultDetails[0][1].slice(1),
                    symbol: vaultDetails[0][2],
                    dragoID: vaultDetails[0][3].c[0],
                    addresssOwner: vaultDetails[0][4],
                    addressGroup: vaultDetails[0][5],
                    sellPrice: 1,
                    buyPrice: 1,
                    price: ((data.div(100).toFixed(2))),
                  },
                  loading: false
                })
              })
            dragoApi.contract.vaulteventful.init()
              .then(() => {
                this.getTransactions(vaultDetails[0][0], dragoApi.contract.vaulteventful, accounts)
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
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      var ethvalue = (log.event === 'BuyGabcoin') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
      var drgvalue = (log.event === 'SellGabcoin') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
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
        drgvalue
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
    console.log(hexAccounts)
    console.log(hexVaultAddress)
    const options = {
      fromBlock: 0,
      toBlock: 'pending',
    }
    console.log(contract.hexSignature)
    const eventsFilterBuy = {
      topics: [
        [contract.hexSignature.BuyGabcoin],
        hexVaultAddress,
        hexAccounts,
        null
      ]
    }
    const eventsFilterSell = {
      topics: [
        [contract.hexSignature.SellGabcoin],
        hexVaultAddress,
        null,
        hexAccounts
      ]
    }
    const buyVaultEvents = contract
      .getAllLogs(eventsFilterBuy)
      .then((vaultTransactionsLog) => {
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

  export default withRouter(PageFundDetailsVaultTrader)