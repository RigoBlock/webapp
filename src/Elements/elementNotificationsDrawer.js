import { List } from 'material-ui/List';
import Drawer from 'material-ui/Drawer'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ElementNotification from './elementNotification'
import { Row, Col } from 'react-flexbox-grid'
import AppBar from 'material-ui/AppBar';
import classNames from 'classnames'
import utils from '../_utils/utils'
import { connect } from 'react-redux';
import styles from './elementNotificationsDrawer.module.css';


var timerId = null;

function mapStateToProps(state) {
  return {
    recentTransactions: state.transactions.queue
  };
}

class ElementNotificationsDrawer extends Component {

  static propTypes = {
    handleToggleNotifications: PropTypes.func.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    recentTransactions: PropTypes.object.isRequired,
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
  };

  state = {
    notificationsOpen: false,
    subscriptionIDContractDrago: [],
    contract: null
  }

  // Redux actions
  updateTransactionsQueueAction = (newRecentTransactions) => {
    return {
      type: 'UPDATE_TRANSACTIONS',
      transactions: newRecentTransactions
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    var stateUpdate = true
    var propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    // propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    // stateUpdate = (!utils.shallowEqual(this.state, nextState))
    return stateUpdate || propsUpdate
  }

  componentWillReceiveProps() {
    // console.log(nextProps.recentTransactions)
    // if (nextProps.notificationsOpen) {
    //   // this.detachInterface()
    // }
  }

  componentDidMount() {
    const that = this
    var runTick = () => {
      timerId = setTimeout(function tick() {
        that.updateTransactionsQueue()
        timerId = setTimeout(tick, 2000); // (*)
      }, 2000);
    }
    runTick()
  }

  updateTransactionsQueue = () => {
    // Processing the queue in order to update the transactions status
    const { api } = this.context
    const { recentTransactions } = this.props
    const newRecentTransactions = utils.updateTransactionsQueue(api, recentTransactions)
    this.props.dispatch(this.updateTransactionsQueueAction(newRecentTransactions))
  }

  componentWillUnmount() {
    this.detachInterface()
  }

  handleToggleNotifications = () => {
    // Setting a small timeout to make sure that the state is updated with 
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    // setTimeout(this.detachInterface, 3000)
    this.detachInterface()
    this.props.handleToggleNotifications()
  }

  renderPlaceHolder = () => {
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

  renderNotifications = () => {
    const eventType = 'transaction'
    var eventStatus = 'executed'
    var primaryText, drgvalue, symbol = null
    var secondaryText = []
    var timeStamp = ''
    var txHash = ''
    const { recentTransactions } = this.props
    if (recentTransactions.size === 0) {
      return <div className={styles.noRecentTransactions}><p className={styles.noTransacationsMsg}>No recent transactions.</p></div>
    }
    return Array.from(recentTransactions).reverse().map((transaction) => {
      secondaryText = []
      var value = transaction.pop()
      var key = transaction.pop()
      timeStamp = value.receipt ? utils.dateFromTimeStamp(value.timestamp) : utils.dateFromTimeStamp(value.timestamp)
      txHash = value.hash.length !== 0 ? txHash = value.hash : ""
      switch (value.action) {
        case "BuyDrago":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Buy " + drgvalue + " " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "SellDrago":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Sell " + drgvalue + " " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "BuyVault":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Deposit " + drgvalue + " ETH"
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "SellVault":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Withdraw " + drgvalue + " ETH"
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "DragoCreated":
          symbol = value.symbol
          primaryText = "Deploy " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "CreateVault":
          symbol = value.symbol
          primaryText = "Deploy " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "TransferGRG":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Transfer " + drgvalue + " " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "TransferETH":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Transfer " + drgvalue + " " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "WrapETH":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Wrap " + drgvalue + " " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "UnWrapETH":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Unwrap " + drgvalue + " " + symbol
          secondaryText[0] = "Status: " + value.status.charAt(0).toUpperCase() + value.status.slice(1)
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

  render() {
    const { notificationsOpen, recentTransactions } = this.props
    var drawerHeight = 72
    if (recentTransactions.size !== 0) {
      drawerHeight = 72 * recentTransactions.size
    }
    return (
      <span>
        <Drawer width={300} openSecondary={true}
          open={notificationsOpen} zDepth={1} docked={true}
          containerClassName={styles.notifications}
          onRequestChange={this.handleToggleNotifications}
          containerStyle={{height: drawerHeight.toString()}}
        >

          {/* <Row>
            <Col xs={12}>
              <AppBar
                title={<span>Network ok</span>}
                showMenuIconButton={false}
              />
            </Col>
          </Row> */}

          <Row>
            <Col xs={12}>
              <List>
                {this.renderNotifications()}
              </List>
            </Col>
          </Row>
        </Drawer>
      </span>
    )
  }

  detachInterface = () => {
    clearInterval(timerId)
  }
}

export default connect(mapStateToProps)(ElementNotificationsDrawer)