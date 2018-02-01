// Copyright 2016-2017 Rigo Investment Sarl.

import { rigotoken } from '../contracts'
import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import Accounts from '../Accounts';
import ApplicationDragoManager from './ApplicationDragoManager'
import ApplicationDragoTrader from './ApplicationDragoTrader'
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDragoHome.module.css';

import {
  DEFAULT_NETWORK_ID,
  DEFAULT_NETWORK_NAME,
  MSG_NO_KOVAN,
  MSG_NETWORK_STATUS_OK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_OK,
  NETWORK_WARNING,
  INFURA,
  RIGOBLOCK,
  LOCAL,
  CUSTOM,
  ALLOWED_ENDPOINTS, 
  DEFAULT_ENDPOINT
} from '../utils/const'
import { Grid, Row, Col } from 'react-flexbox-grid';
import LeftSideDrawerFunds from '../Elements/leftSideDrawerFunds';
import PropTypes from 'prop-types';
import utils from '../utils/utils'
import NotificationSystem from 'react-notification-system'
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import ElementNotification from '../Elements/elementNotification'
import ElementNotificationsDrawer from '../Elements/elementNotificationsDrawer'
import CheckAuthPage from '../Elements/checkAuthPage'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'


const DIVISOR = 10 ** 6;  //tokens are divisible by one million
var sourceLogClass = null

export default class ApplicationDragoHome extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
    sourceLogClass = this.constructor.name
  }

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.func.isRequired
  };

  static childContextTypes = {
    addTransactionToQueue: PropTypes.func
  };
  
  getChildContext () {   
    return {
      addTransactionToQueue: this.addTransactionToQueue
    };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    isManager: PropTypes.bool.isRequired, 
    notificationsOpen: PropTypes.bool.isRequired
  };

  state = {
    accounts: [],
    accountsInfo: {},
    accountsBalanceError: false,
    // blockNumber: new BigNumber(-1),
    rigoTokenBalance: null,
    ethBalance: null,
    loading: true,
    subscriptionIDDrago: null,
    subscriptionIDContractDrago: null,
    contract: null,
    instance: null,
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    infura: false,
    prevBlockNumber: 0,
    networkStatus: MSG_NETWORK_STATUS_OK,
    networkError: NETWORK_OK,
    networkCorrect: false,
    warnMsg: null,
    recentTransactions: new Map(),
  }

  scrollPosition = 0
  activeElement = null

  shouldComponentUpdate(nextProps, nextState){    
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    const stateUpdate = (!utils.shallowEqual(this.state, this.state.loading))
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = ReactDOM.findDOMNode(this);
    if (element != null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate 
  }

  componentWillMount () {
  } 

  componentDidMount() {
    // Allowed endpoints are defined in const.js
    var selectedEndpoint = localStorage.getItem('endpoint')
    var allowedEndpoints = new Map(ALLOWED_ENDPOINTS)
    if (allowedEndpoints.has(selectedEndpoint)) {
      switch (selectedEndpoint) {
        case INFURA:
        console.log(INFURA)
          this.attachInterfaceInfura()
          .then(() =>{
          })
        break;
        case RIGOBLOCK:
          console.log(RIGOBLOCK)
          this.attachInterfaceRigoBlock()
          .then(() =>{
          })
        break; 
        case LOCAL:
          console.log(LOCAL)
          this.attachInterfaceRigoBlock()
          .then(() =>{
          })
        break; 
      }
    } else {
      localStorage.setItem('endpoint', DEFAULT_ENDPOINT)
      this.attachInterfaceInfura()
      .then(() =>{
      })
    }
    this._notificationSystem = this.refs.notificationSystem
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate(prevProps, prevState) {
    // The following code is needed to fix a bug in tables. The scrolling posision is reset at every component re-render.
    // Setting the page scroll position
    var sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} -> componentDidUpdate`);
    const element = ReactDOM.findDOMNode(this);
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

  updateTransactionsQueue = () => {
    // Processing the queue in order to update the transactions status
    const { api } = this.context
    const { recentTransactions } = this.state
    const newRecentTransactions = utils.updateTransactionsQueue(api,recentTransactions)
    newRecentTransactions !== null
    ? this.setState({
      recentTransactions: newRecentTransactions
    })
    : null
  }

  addTransactionToQueue = (transactionId, transactionDetails) => {
    // Adding the transaction to the sessione queue
    const { recentTransactions } = this.state
    var newRecentTransactions = new Map(recentTransactions)
    newRecentTransactions.set(transactionId, transactionDetails)
    // Saving to state and updating the transactions in the queue
    this.setState({
      recentTransactions: newRecentTransactions
    }, this.updateTransactionsQueue)
  }

  render () {
    const { ethBalance, loading, blockNumber, accounts, allEvents, accountsInfo, networkError, networkStatus, networkCorrect, warnMsg } = this.state;
    const { isManager, location, handleToggleNotifications, notificationsOpen }  = this.props

    if (loading) {
      return <Loading></Loading>
    }

    if (ethBalance === null) {
      return null
    }

    console.log(accounts)

    if ((accounts.length === 0 || !networkCorrect)) {
      return (
        <span>
          <CheckAuthPage warnMsg={warnMsg} location={location}/>
          <ElementBottomStatusBar
            blockNumber={this.state.prevBlockNumber}
            networkName={DEFAULT_NETWORK_NAME}
            networkError={networkError}
            networkStatus={networkStatus} />
        </span>
    )
    }

    if (isManager) {
      var notificationStyle = {
        NotificationItem: { // Override the notification item
          DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '0px 0px 0px 0px'
          },
      
          info: { // Applied only to the success notification item
            backgroundColor: 'white'
          }
        }
      }
      return (
        <span>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
              <LeftSideDrawerFunds location={location} isManager={isManager}/>
            </Col>
            <Col xs={10}>
              <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle} />
              <ApplicationDragoManager
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo}
                isManager={isManager}
              />
            </Col>
            <Row>
              <Col xs={12}>
                {notificationsOpen ? (
                  <ElementNotificationsDrawer
                    handleToggleNotifications={handleToggleNotifications}
                    notificationsOpen={notificationsOpen}
                    accounts={accounts}
                    recentTransactions={this.state.recentTransactions}
                    updateTransactionsQueue={this.updateTransactionsQueue}
                  />
                ) : (
                    null
                  )}
              </Col>
            </Row>
          </Row>
          <ElementBottomStatusBar 
          blockNumber={this.state.prevBlockNumber}
          networkName={DEFAULT_NETWORK_NAME}
          networkError={networkError}
          networkStatus={networkStatus} />
        </span>
      );
    }

    if (!isManager) {

      var notificationStyle = {
        NotificationItem: { // Override the notification item
          DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '0px 0px 0px 0px'
          },
      
          info: { // Applied only to the success notification item
            backgroundColor: 'white'
          }
        }
      }
      return (
        <span>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
            <LeftSideDrawerFunds location={location} isManager={isManager}/>
            </Col>
            <Col xs={10}>
              <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle}/>
              <ApplicationDragoTrader 
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo}
                isManager={isManager}
              />
            </Col>
          </Row>
            <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer 
                handleToggleNotifications={handleToggleNotifications} 
                notificationsOpen={notificationsOpen}
                accounts={accounts}
                recentTransactions={this.state.recentTransactions}
                updateTransactionsQueue={this.updateTransactionsQueue}
                />
              ) : (
                null
              )}
            </Col>
          </Row>
          <ElementBottomStatusBar 
          blockNumber={this.state.prevBlockNumber}
          networkName={DEFAULT_NETWORK_NAME}
          networkError={networkError}
          networkStatus={networkStatus} />
        </span>
      );
    }
  }

  notificationAlert = (primaryText, secondaryText, eventType = 'transfer') => {
    return (
      <ElementNotification 
        primaryText={primaryText}
        secondaryText={secondaryText}
        eventType={eventType}
        eventStatus='executed'
        txHash=''
        />
    )
  }

  onNewBlockNumber = (_error, blockNumber) => {
    if (_error) {
      console.error('onNewBlockNumber', _error)
      return
    }
    const { api } = this.context;
    const prevBlockNumber = "".concat(this.state.prevBlockNumber)
    console.log(`${sourceLogClass} -> Last blocK: ` + prevBlockNumber)
    console.log(`${sourceLogClass} -> New block: ` + blockNumber.toFixed())
    this.setState({
      prevBlockNumber: blockNumber.toFixed()
    })
    // Checking that the current blockNumber is higher than previous one.
    if (prevBlockNumber > blockNumber.toFixed()) {
      console.log(`${sourceLogClass} -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`)
      this.setState({
        prevBlockNumber: blockNumber.toFixed()
      })
      return null
    }
    const accounts = [].concat(this.state.accounts);

    // Checking RigoToken balance
    const rigoTokenContract = api.newContract(rigotoken, "0x7f026C6E42C808bA02A551BDdD753F9927dA06b1")

    const tokensQueries = accounts.map((account) => {
      console.log(`${sourceLogClass} API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${account.name}`)
      return rigoTokenContract.instance.balanceOf.call({}, [account.address])
    })

    // Checking ethereum balance
    const ethQueries = accounts.map((account) => {
      console.log(`${sourceLogClass} API call getBalance -> applicationDragoHome: Getting balance of account ${account.name}`)
      return api.eth.getBalance(account.address, new BigNumber(blockNumber))
    })
    const promisesBalances = [...ethQueries, ...tokensQueries]

    Promise
      .all(promisesBalances)
      .then((results) => {
        // Splitting the the result array between ethBalances and rigoTokenBalances
        const halfLength = Math.ceil(results.length / 2)
        const ethBalances = results.splice(0,halfLength)
        const rigoTokenBalances = results
        console.log(ethBalances)
        console.log(rigoTokenBalances)
        const prevAccounts = [].concat(this.state.accounts)
        prevAccounts.map((account,index) =>{
          const newEthBalance = api.util.fromWei(ethBalances[index]).toFormat(3)
          // console.log('Last balance: ' + account.ethBalance)
          // console.log('New balance: ' + newEthBalance)
          if ((account.ethBalance !== newEthBalance) && prevBlockNumber != 0) {
            console.log(`${account.name} balance changed.`)
            var eventType = 'balanceChange'
            var secondaryText = []
            var balDifference = account.ethBalance - newEthBalance
            if (balDifference > 0) {
              console.log(`You transferred ${balDifference.toFixed(4)} ETH!`)
              secondaryText[0] = `You transferred ${balDifference.toFixed(4)} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            } else {
              console.log(`You received ${Math.abs(balDifference).toFixed(4)} ETH!`)
              secondaryText[0] = `You received ${Math.abs(balDifference).toFixed(4)} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            }
            if (this._notificationSystem && this.state.accountsBalanceError === false) {
              this._notificationSystem.addNotification({
                  level: 'info',
                  position: 'br',
                  autoDismiss: 10,
                  children: this.notificationAlert(account.name, secondaryText)
              });
            }
          }

        })
        return [ethBalances,rigoTokenBalances]
      })
      .then((balances) => {
        const ethBalances = balances[0]
        const rigoTokenBalances = balances[1]
        this.setState({
          networkError: NETWORK_OK,
          networkStatus: MSG_NETWORK_STATUS_OK,
          accountsBalanceError: false,
          rigoTokenBalance: rigoTokenBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: [].concat(accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            const rigoTokenBalance = rigoTokenBalances[index];
            account.rigoTokenBalance = api.util.fromWei(rigoTokenBalance).toFormat(3);
            return account;
          })
        )
        })
      })
      .catch((error) => {
        console.warn(`${sourceLogClass} -> ${error}`)
        // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
        this.setState({
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
          accountsBalanceError: true,
          ethBalance: new BigNumber(0),
          accounts: [].concat(accounts.map((account, index) => {
            account.ethBalance = api.util.fromWei(new BigNumber(0)).toFormat(3);
            return account;
          })
        )
        })
      });
  }

  getAccountsParity () {
    const { api } = this.context;
    return api.parity
      .accountsInfo()
      .catch((error) => {
        console.warn('getAccounts', error);
        return api.parity
          .accounts()
          .then((accountsInfo) => {
            return Object
              .keys(accountsInfo)
              .filter((address) => accountsInfo[address].uuid)
              .reduce((ret, address) => {
                ret[address] = {
                  name: accountsInfo[address].name
                };
                return ret;
              }, {});
          });
      })
      .then((accountsInfo) => {
        console.log('Parity getAccounts', accountsInfo)
        Object.keys(accountsInfo).forEach(function(k) {
          accountsInfo[k] = {
            name: accountsInfo[k].name,
            source: "parity"
          }
        })
        return accountsInfo
      });
  }

  getAccountsMetamask () {

    const web3 = window.web3
    if (typeof web3 === 'undefined') {
      return
    }
    return web3.eth.net.getId()
    .then((networkId) => {
      if (networkId != DEFAULT_NETWORK_ID) {
        this.setState({
          networkCorrect: false,
          warnMsg: MSG_NO_KOVAN
        })
      } else {
        this.setState({
          networkCorrect: true
        }) 
      }
    })
    .then (() =>{
      return web3.eth.getAccounts()
      .then(accounts => {
        const balance = web3.eth.getBalance(accounts[0])
        .then(balance => {
          return balance
        })
        const accountsMetaMask = {
          [accounts[0]]: {
            name: "MetaMask",
            source: "MetaMask"
          }
        }
        return accountsMetaMask
      })
      .catch(() =>{
        return
      })
    })
  }

  attachInterfaceInfura = () => {
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
    console.log('Interface Infura')
    return Promise
    .all([
      this.getAccountsMetamask()
    ])
    .then(([accountsMetaMask]) => {
      const allAccounts = {...accountsMetaMask}
      console.log('accounts loaded')
      this.setState({
        accountsInfo: accountsMetaMask,
        loading: false,
        accounts: Object
          .keys(allAccounts)
          .map((address) => {
            const info = allAccounts[address] || {};
            return {
              address,
              name: info.name,
              source: info.source,
              ethBalance: "0"
            };
          })
        });
        api.subscribe('eth_blockNumber', this.onNewBlockNumber)
        .then((subscriptionID) => {
          console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({subscriptionIDDrago: subscriptionID});
        })
        .catch((error) => {
          console.warn('error subscription', error)
        });
      })
      .catch((error) => {
        console.warn('attachInterface', error)
      });
  }

  attachInterfaceRigoBlock = () => {
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
    console.log('Interface RigoBlock')
    return Promise
    .all([
      this.getAccountsParity(),
      this.getAccountsMetamask()
    ])
    .then(([accountsInfo, accountsMetaMask]) => {
      const allAccounts = {...accountsInfo, ...accountsMetaMask}
      this.setState({
        accountsInfo,
        loading: false,
        accounts: Object
          .keys(allAccounts)
          .map((address) => {
            const info = allAccounts[address] || {};
            return {
              address,
              name: info.name,
              source: info.source,
              ethBalance: "0"
            };
          })
      });
      api.subscribe('eth_blockNumber', this.onNewBlockNumber)
      .then((subscriptionID) => {
        console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
        this.setState({subscriptionIDDrago: subscriptionID});
      })
      .catch((error) => {
        console.warn('error subscription', error)
      });
    })
    .catch((error) => {
      console.warn('attachInterface', error)
      // this.attachInterfaceInfura()
    });
  }


  detachInterface = () => {
    const { subscriptionIDDrago, contract, subscriptionIDContractDrago } = this.state;
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
    console.log(`applicationDragoHome: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDDrago}`);
    api.unsubscribe(subscriptionIDDrago).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
  } 
}
