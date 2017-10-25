// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';
import * as abis from '../contracts';

import styles from './applicationExchange.module.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import Accounts from '../Accounts';
import { ActionsExchange, ActionWithdraw, ActionCancelOrder, ActionPlaceOrder, ActionFinalize, ActionDeposit } from '../ActionsExchange';
//import EventsExchange from '../EventsExchange';
//import EventsDeposits, { EventsWithdraws, EventsOrdersPlaced, EventsOrdersCancelled, EventsMatched, EventsFinalized } from '../EventsExchange';

import Loading from '../Loading';
import Status from '../Status';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 18;  // calculations in ETH

export default class ApplicationExchange extends Component {


  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };

  static childContextTypes = {
    // api: PropTypes.object,
    contractOracle: PropTypes.object,
    contractExchange: PropTypes.object,
    instance: PropTypes.object,
    //allEvents: PropTypes.object,
    muiTheme: PropTypes.object
  };

  getChildContext () {
    const { /*allEvents, */contractExchange, contractOracle, instance } = this.state;
    //const { allEvents } = this.props;

    return {
      // api,
      contractExchange,
      contractOracle,
      instance,
      //allEvents,
      // muiTheme
    };
  }

/*
  static propTypes = {
    allEvents: PropTypes.object.isRequired  //this is new
  }
*/

  state = {
    action: null,
    address: null,
    accounts: [],
    accountsInfo: {},
    blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    gabBalance: new BigNumber(0),
    instance: null,
    loading: true,
    //price: null,
    authority: null,
    subscriptionIDExchange: null
    //next_id: null, //added
    //min_stake: null, //added
    //remaining: null,
    //totalSupply: null
  }

  componentDidMount () {
    this.attachInterface();
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  render () {
    const { /*allEvents, */accounts, accountsInfo, address, blockNumber, gabBalance, loading, /*price,*/authority/*, min_stake*/ } = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <div className={ styles.body } style={ bgstyle }>
        { this.renderModals() }
        <ActionsExchange
          gabBalance={ gabBalance }
          onAction={ this.onAction } />
      </div>
    );
  }
/*
<div className={styles.root}>
  <GridList className={styles.gridlist}>
    <EventsDeposits
      accountsInfo = { accountsInfo } />
  </GridList>
  <GridList className={styles.gridlist}>
    <EventsWithdraws
      accountsInfo = { accountsInfo } />
  </GridList>
  <GridList className={styles.gridlist}>
    <EventsMatched
      accountsInfo = { accountsInfo } />
  </GridList>
  <GridList className={styles.gridlist}>
    <EventsOrdersPlaced
      accountsInfo = { accountsInfo } />
  </GridList>
  <GridList className={styles.gridlist}>
    <EventsOrdersCancelled
      accountsInfo = { accountsInfo } />
  </GridList>
  <GridList className={styles.gridlist}>
    <EventsFinalized
      accountsInfo = { accountsInfo } />
  </GridList>
</div>


.filter((event) => event.type === 'Deposit' || 'Withdraw'

{allEvents.filter((event) => (
<EventsExchange
  event = { 'Deposit' }
  accountsInfo = { accountsInfo } />
))}
*/

  renderModals () {
    const { action, accounts, /*price,*/ dragoName, dragoSymbol } = this.state;

    switch (action) {
      case 'Withdraw':
        return (
          <ActionWithdraw
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'PlaceOrder':
        return (
          <ActionPlaceOrder
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'CancelOrder':
        return (
          <ActionCancelOrder
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      case 'Deposit':
        return (
          <ActionDeposit
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      case 'Finalize':
        return (
          <ActionFinalize
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      default:
        return null;
    }
  }



  onAction = (action) => {
    this.setState({
      action
    });
  }

  onActionClose = () => {
    this.setState({
      action: null
    });
  }

  onNewBlockNumber = (_error, blockNumber) => {
    const { instance, accounts } = this.state;
    const { api } = this.context;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
      //  instance.min_stake.call(),
        instance.authority.call()
      //  instance.next_id.call(),
      //  instance.price.call()
      ])
      .then(([/*min_stake, next_id, price*/authority]) => {
        this.setState({
          blockNumber,
          //min_stake,
            authority
          //next_id
          //price
        });

        //gabQueries is amended sees account(0) as undefined //ToBeFixed
        //fix: tokens[0][_who]  //amend deposit functions
        const gabQueries = accounts.map((account) => instance.marginOf.call({}, [account.address]));
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        accounts.map((account) => {
          console.log('API call -> applicationExchange: Getting balance of account', account.name);
          }
        )
        return Promise.all([
          Promise.all(gabQueries),
          Promise.all(ethQueries)
        ]);
      })
      .then(([gabBalances, ethBalances]) => {
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          gabBalance: gabBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            const gabBalance = gabBalances[index];

            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            account.gabBalance = gabBalance.div(DIVISOR).toFormat(6);
            account.hasGab = gabBalance.gt(0);

            return account;
          })
        });
      })
      .catch((error) => {
        console.warn('onNewBlockNumber', error);
      });
  }

  getAccounts () {
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
        console.log('getAccounts', accountsInfo);

        return accountsInfo;
      });
  }

  attachInterface = () => {
    const { api } = this.context;
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('exchange2'), 'A']),
            this.getAccounts()
          ]);
      })
      .then(([address, accountsInfo]) => {
        console.log(`exchange was found at ${address}`);

        //const theOracle = oracleContract.at(theCFD.oracle());
        //const contractOracle = api.newContract(abis.oracle, contractExchange);
        const contractExchange = api.newContract(abis.exchange, address);
          //this is the interface of the contract, that is connected with oracle

        this.setState({
          loading: false,
          address,
          contractExchange,
          accountsInfo,
          instance: contractExchange.instance,
          accounts: Object
            .keys(accountsInfo)
            .map((address) => {
              const info = accountsInfo[address] || {};

              return {
                address,
                name: info.name
              };
            })
        });

        api.subscribe('eth_blockNumber', this.onNewBlockNumber)
        .then((subscriptionID) => {
          console.log(`applicationExchange: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({subscriptionIDExchange: subscriptionID});
        });
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }

  detachInterface = () => {
    const { api } = this.context;
    const { subscriptionIDExchange } = this.state;
    console.log(`applicationExchange: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDExchange}`);
    api.unsubscribe(subscriptionIDExchange).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
  } 
}
