import  * as Colors from 'material-ui/styles/colors';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Subheader from 'material-ui/Subheader';
import Immutable from 'immutable'
import ElementNotification from './elementNotification'
import { formatCoins, formatEth } from '../format'
import { Grid, Row, Col } from 'react-flexbox-grid'
import AppBar from 'material-ui/AppBar';
import classNames from 'classnames'
import { REGISTRY_KOVAN } from '../utils/const'
import DragoApi from '../DragoApi/src'
import LinearProgress from 'material-ui/LinearProgress';
import utils from '../utils/utils'


import * as abis from '../contracts';

import styles from './elementNotificationsDrawer.module.css';

var menuStyles = {
  profileIcon: {
      color: "#ffffff"
  },
};

var timerId = null;

const transactionStyle = {
  executed: {
    backgroundColor: Colors.green50,
    border: '1px solid',
    borderRadius: '2px',
    borderColor: Colors.green100,
    margin: '2px'
  },
  authorization: {
    backgroundColor: Colors.amber50,
    border: '1px solid',
    borderRadius: '2px',
    borderColor: Colors.amber100,
    margin: '2px',
    progressBar: {
      color: Colors.amber400,
      backgroundColor: Colors.amber100,
    },
  }, 
  pending: {
    backgroundColor: Colors.lightBlue50,
    border: '1px solid',
    borderRadius: '2px',
    borderColor: Colors.lightBlue100,
    margin: '2px',
    progressBar: {
      color: Colors.lightBlue400,
      backgroundColor: Colors.lightBlue100,
    },
  }, 
  error: {
    backgroundColor: Colors.red50,
    border: '1px solid',
    borderRadius: '2px',
    borderColor: Colors.red100,
    margin: '2px'
  }, 
}

export default class ElementNotificationsDrawer extends Component {

  static propTypes = {
    recentTransactions: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
    accounts: PropTypes.array.isRequired,
    updateTransactionsQueue: PropTypes.func.isRequired
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.func.isRequired, 
  };

  state = {
    notificationsOpen: false,
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDContractDrago: [],
    contract: null
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.recentTransactions)
    if (nextProps.notificationsOpen) {
      // this.detachInterface()
    }
  }
  
  componentDidMount() {
    const that = this
    var runTick = () => {
      timerId = setTimeout(function tick() {
        console.log('tick')
        that.props.updateTransactionsQueue()
        timerId = setTimeout(tick, 2000); // (*)
      }, 2000);
    }
    runTick()
  }

  componentWillUnmount () {
    // this.detachInterface()
  }

  handleToggleNotifications = () =>{
    // Setting a small timeout to make sure that the state is updated with 
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    // setTimeout(this.detachInterface, 3000)
    this.setState({
      allEvents: [],
      minedEvents: [],
      pendingEvents: []
    });
    this.detachInterface()
    this.props.handleToggleNotifications()
  }

  renderPlaceHolder = () =>{
    return (
      <div>
        <div className={classNames(styles.module, styles.post)}>
          <div className={styles.circle}></div>
          <div className={styles.wrapper}>
            <div className={classNames(styles.line, styles.width110)}></div>
            <div className={classNames(styles.line, styles.width250)}></div>
          </div>
        </div>
      </div>
    )
  }

  renderNotifications = (events) => {
    const { api } = this.context
    const eventType = 'transaction'
    var eventStatus = 'executed'
    var primaryText, drgvalue, symbol  = null
    var secondaryText = []
    var timeStamp = ''
    var txHash = ''
    const { recentTransactions } = this.props
    return Array.from(recentTransactions).reverse().map( (transaction, index) => {
      console.log(transaction)
      secondaryText = []
      var value = transaction.pop()
      var key = transaction.pop()
      timeStamp = value.receipt ? utils.dateFromTimeStamp(value.timestamp) : utils.dateFromTimeStamp(value.timestamp)
      txHash = value.hash.length !== 0 ? txHash = value.hash : ''
      console.log('txHash: ' + txHash)
      console.log(value)
      switch (value.action) {
        case "BuyDrago":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Buy " + drgvalue + ' ' + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "SellDrago":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Sell " + drgvalue + ' ' + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "BuyVault":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Deposit " + drgvalue + ' ETH'
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
        break;
        case "SellVault":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Withdraw " + drgvalue + ' ETH'
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "DragoCreated":
          symbol = value.symbol
          primaryText = "Deploy " + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "CreateVault":
          symbol = value.symbol
          primaryText = "Deploy " + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
      }
      return (
        <ElementNotification key={key}
          primaryText={primaryText}
          secondaryText={secondaryText}
          eventType={eventType}
          eventStatus={eventStatus}
          txHash={txHash}
        >
        </ElementNotification>
      )
    })
  }

  render () {
    const { notificationsOpen } = this.props
    const { allEvents } = this.state
    console.log('render')
    // console.log(allEvents)
    return (
      <span>
        <Drawer width={300} openSecondary={true}
          open={notificationsOpen} zDepth={1} docked={false}
          classNameName={styles.notifications}
          onRequestChange={this.handleToggleNotifications}
        >
          <AppBar
            title={<span>Network</span>}
            showMenuIconButton={false}
          />
          <Row>
            <Col xs={12}>
              {/* <List>
                <div style={transactionStyle.authorization}>
                  <ListItem
                    disabled={true}
                    primaryText='BUY test 0.1 ETH'
                    secondaryText={
                      <p>
                        Status: Waiting<br />
                        Time: 2018-01-07 13:28:35
                    </p>
                    }
                    secondaryTextLines={2}
                    leftAvatar={<Avatar src="img/ETH.svg" />}
                  >
                  </ListItem>
                  <div className={styles.progressBar}>
                    <LinearProgress color={transactionStyle.authorization.progressBar.color} style={transactionStyle.authorization.progressBar} mode="indeterminate" />
                  </div>
                </div>
                <ListItem
                  disabled={true}
                  primaryText='BUY test 0.1 ETH'
                  secondaryText={
                    <p>
                      Status: Waiting<br />
                      Time: 2018-01-07 13:28:35
                    </p>
                  }
                  secondaryTextLines={2}
                  leftAvatar={<Avatar src="img/ETH.svg" />}
                  style={transactionStyle.pending}
                >
                </ListItem>
                <ListItem
                  disabled={true}
                  primaryText='BUY test 0.1 ETH'
                  secondaryText={
                    <p>
                      Status: Waiting<br />
                      Time: 2018-01-07 13:28:35
                    </p>
                  }
                  secondaryTextLines={2}
                  leftAvatar={<Avatar src="img/ETH.svg" />}
                  style={transactionStyle.executed}
                >
                </ListItem>
                <ListItem
                  disabled={true}
                  primaryText='BUY test 0.1 ETH'
                  secondaryText={
                    <p>
                      Status: Waiting<br />
                      Time: 2018-01-07 13:28:35
                    </p>
                  }
                  secondaryTextLines={2}
                  leftAvatar={<Avatar src="img/ETH.svg" />}
                  style={transactionStyle.error}
                >
                </ListItem>
              </List> */}
              <List>
                {this.renderNotifications()}
              </List>
              {/* <List>
                <ElementNotification key='123'
                  primaryText='BUY test 0.1 ETH'
                  secondaryText={['gino', 'pino']}
                  eventType='transaction'
                  eventStatus='authorization'
                  txHash=''
                >
                </ElementNotification>
              </List> */}
            </Col>
          </Row>
        </Drawer>
      </span>
    )
  }

  attachInterfaceInfura = () => {
    const { api } = this.context;
    var sourceLogclassName = this.constructor.name
    const registry = api.newContract(abis.registry, REGISTRY_KOVAN).instance
    return Promise
    .all([
      registry.getAddress.call({}, [api.util.sha3('eventful'), 'A'])
    ])
    .then(([address]) => {
      console.log(`${sourceLogclassName} -> Drago Eventful was found at ${address}`);
      const contract = api.newContract(abis.eventful, address)
      this.setupFiltersInfura (contract)
      return contract
    })
    .catch((error) => {
      console.warn('attachInterface', error)
    });
  }

  attachInterfaceRigoBlock = () => {
    const { api } = this.context;
    var sourceLogclassName = this.constructor.name
    return api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`${sourceLogclassName} -> The Registry was found at ${registryAddress}`);
        const registry = api.newContract(abis.registry, registryAddress).instance;
        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('eventful'), 'A']),
          ]);
      })
      .then(([address]) => {
        console.log(`${sourceLogclassName} -> Drago Eventful was found at ${address}`);
        const contract = api.newContract(abis.eventful, address)
        this.setState({
          contract: contract,
        });
        this.setupFiltersRigoBlock (contract)
        return contract
      })
      .catch((error) => {
        console.warn('attachInterface', error)
      });
  }

  processLogs = (_logs) =>{
    const { api } = this.context;
    var allEvents = null
    var minedEvents = null
    var pendingEvents = null
    const sortEvents = (a, b) => b.blockNumber.cmp(a.blockNumber) || b.logIndex.cmp(a.logIndex)
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log));
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log;
      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params: Object.keys(params).reduce((data, name) => {
          data[name] = params[name].value;
          return data;
        }, {}),
        key
      };
    };
    // _logs.splice(0, _logs.length - 5)
    // console.log(_logs.splice(-2))
    console.log(_logs.sort(sortEvents))
    console.log(_logs)
    var sortedLogs = _logs.sort(sortEvents).reverse()
    const logs = sortedLogs.map(logToEvent)
    // const logs = _logs.map(logToEvent);
    minedEvents = logs
      .filter((log) => log.state === 'mined')
      .reverse()
      // .concat(this.state.minedEvents)
      // .sort(sortEvents);
    pendingEvents = logs
      .filter((log) => log.state === 'pending')
      .reverse()
      .concat(this.state.pendingEvents.filter((event) => {
        return !logs.find((log) => {
          const isMined = (log.state === 'mined') && (log.transactionHash === event.transactionHash);
          const isPending = (log.state === 'pending') && (log.key === event.key);

          return isMined || isPending;
        });
      }))
      // .sort(sortEvents);
    
    allEvents = pendingEvents.concat(minedEvents);

    this.setState({
      allEvents,
      minedEvents,
      pendingEvents
    });
  }

  setupFiltersRigoBlock (contract) {
    // const { contract } = this.context;
    const { api } = this.context;
    const options = {
      fromBlock: 0,
      toBlock: 'pending',
      limit: 5
    };

    contract.subscribe(null, options, (error, _logs) => {
      if (error) {
        console.error('setupFilters', error);
        return;
      }

      if (!_logs.length) {
        return;
      }
      console.log(_logs)
      this.processLogs(_logs)
    }).then((subscriptionID) => {
      const { subscriptionIDContractDrago } = this.state
      var sourceLogclassName = this.constructor.name
      console.log(`${sourceLogclassName}: Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      var subscriptionIDs = [].concat(subscriptionIDContractDrago)
      subscriptionIDs.push(subscriptionID)
      console.log(subscriptionIDs)
      this.setState({subscriptionIDContractDrago: subscriptionIDs});
    });
  }

  setupFiltersInfura(contract) {
    const { api } = this.context;
    const dragoApi = new DragoApi(api)
    const { accounts } = this.props
    const topics = { topics: [null, null, null, null] }
    var hexAccounts = null
    if (accounts !== null) {
      hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }
    hexAccounts = [null, ...hexAccounts]
    hexAccounts = [""]
    console.log(hexAccounts)
    const options = {
      fromBlock: 0,
      toBlock: 'pending',
      // limit: 5
    };

    dragoApi.contract.eventful.init()
      .then(() => {
        // Filter for create events
        // const eventsFilterCreate = {
        //   topics: [ 
        //     [dragoApi.contract.eventful.hexSignature.DragoCreated], 
        //     null, 
        //     null,
        //     hexAccounts
        //   ]
        // }
        const eventsFilterCreate = {
          topics: [
            [dragoApi.contract.eventful.hexSignature.DragoCreated,
            dragoApi.contract.eventful.hexSignature.BuyDrago,
            dragoApi.contract.eventful.hexSignature.SellDrago
            ],
            null,
            hexAccounts,
            hexAccounts
          ]
        }
        // // Filter for buy events
        // const eventsFilterBuy = {
        //   topics: [ 
        //     [dragoApi.contract.eventful.hexSignature.BuyDrago], 
        //     null, 
        //     hexAccounts,
        //     null
        //   ]
        // }
        // // Filter for sell events
        // const eventsFilterSell = {
        //   topics: [ 
        //     [dragoApi.contract.eventful.hexSignature.SellDrago], 
        //     null, 
        //     null,
        //     hexAccounts
        //   ]
        // }
        const createDragoEvents =
          contract.getAllLogs(options, eventsFilterCreate)
            .then((dragoTransactionsLog) => {
              return dragoTransactionsLog
            }
            )
        // const buyDragoEvents =
        //   contract.getAllLogs(options, eventsFilterBuy)
        //     .then((dragoTransactionsLog) => {
        //       return dragoTransactionsLog
        //     }
        //     )
        // const sellDragoEvents =
        //   contract.getAllLogs(options, eventsFilterSell)
        //     .then((dragoTransactionsLog) => {
        //       return dragoTransactionsLog
        //     }
        //     )
        return Promise.all([createDragoEvents])
          .then((results) => {
            // Creating an array of promises that will be executed to add timestamp and symbol to each entry
            // Doing so because for each entry we need to make an async call to the client
            // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
            console.log(results)
            // var dragoTransactionsLog = [...results[0], ...results[1], ...results[2]]
            var dragoTransactionsLog = [...results]
            return dragoTransactionsLog
          }
          )
          .then((dragoTransactionsLog) => {
            if (dragoTransactionsLog[0].length != 0) {
              this.processLogs(dragoTransactionsLog)
            }
          })
      })
  }

  detachInterface = () => {
    const { contract } = this.state;
    const { api } = this.context;
    const { subscriptionIDContractDrago } = this.state;
    var sourceLogclassName = this.constructor.name
    console.log('Clear timer ID')
    clearInterval(timerId)
    console.log(subscriptionIDContractDrago)
    const subscriptionIDs = [].concat(subscriptionIDContractDrago)
    if(subscriptionIDs.length > 0) {
      console.log(`${sourceLogclassName} Unsubscribed from contract -> Subscription ID: ${subscriptionIDContractDrago}`);
      this.setState({subscriptionIDContractDrago: []}, () => {
        subscriptionIDs.map(subscription => {
          (typeof subscription !== 'undefined') ? contract.unsubscribe(subscription).catch((error) => {
            console.warn('Unsubscribe error', error);
          }) : null
        })
      })
    }
  }  
}