// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import * as abis from '../contracts';

import Accounts from '../Accounts';
//import Actions, { ActionBuyIn, ActionRefund, ActionTransfer, ActionDeploy } from '../ActionsDrago';
//this is eventful contract only
import { EventsDrago, EventsDragoCreated } from '../EventsDrago';
//import Events from '../EventsDrago'; //customize events, maybe even EventsDragoEventful
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDragoEventful.module.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 6;  //tokens are divisible by one million

export default class ApplicationDragoEventful extends Component {
  static childContextTypes = {
    contract: PropTypes.object,
    instance: PropTypes.object,
    muiTheme: PropTypes.object
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };

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
    authority: null,
    version: null,
    subscriptionIDDragoEventful: null,
    //price: null,
    //nextDragoID: null, //added
    //fee: null, //added
    //remaining: null,
    //totalSupply: null
  }

  componentDidMount () {
    this.attachInterface();
  }

  componentWillUnmount() {
    // We are goint to close the websocket connection when the the user moves away from this app
    this.detachInterface();
  }

  render () {
    const { accounts, accountsInfo, address, blockNumber, gabBalance, loading, authority, version/*price, nextDragoID, fee */} = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }
//{ this.renderModals() } before Status
    return (
      <div className={ styles.body } style={ bgstyle }>
        {/* <Status
          address={ address }
          blockNumber={ blockNumber }
          gabBalance={ gabBalance }
          //price={ price }
          //remaining={ remaining }
          //nextDragoID={ nextDragoID }
          //fee={ fee }
          version={ version }
          authority={ authority }>
          <Accounts
            accounts={ accounts } />
        </Status> */}
        {/* <EventsDragoCreated
          accountsInfo={ accountsInfo } /> */}
        <EventsDrago
          accountsInfo={ accountsInfo } />
      </div>
    );
  }

/*
<Actions
  gabBalance={ gabBalance }
  onAction={ this.onAction } />
*/
/*
  renderModals () {
    const { action, accounts, dragoName, dragoSymbol } = this.state;

    switch (action) {
      case 'BuyIn':
        return (
          <ActionBuyIn
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'Refund':
        return (
          <ActionRefund
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'Transfer':
        return (
          <ActionTransfer
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      case 'Deploy':
        return (
          <ActionDeploy
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      default:
        return null;
    }
  }
*/
  getChildContext () {
    const { contract, instance } = this.state;

    return {
      contract,
      instance,
      muiTheme
    };
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
        //instance.fee.call(),
        //instance.nextDragoID.call(),
        instance.version.call(),
      //  instance.price.call()
      ])
      .then(([version, authority/*fee, nextDragoID, price*/]) => {
        this.setState({
          blockNumber,
          version,
          authority
          //fee,
          //nextDragoID/*,
          //price*/
        });

        //const gabQueries = accounts.map((account) => instance.dragoOf.call({}, [account.address])); //calling instead of balanceOf()
        const gabQueries = accounts.map((account) => api.eth.getBalance(account.address));
        // const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        const ethQueries = gabQueries;
        accounts.map((account) => {
          console.log('API call getBalance -> applicationDragoEventful: Getting balance of account', account.name);
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
            registry.getAddress.call({}, [api.util.sha3('eventful'), 'A']),
            this.getAccounts()
          ]);
      })
      .then(([address, accountsInfo]) => {
        console.log(`drago eventful was found at ${address}`);

        const contract = api.newContract(abis.eventful, address);

        this.setState({
          loading: false,
          address,
          contract,
          accountsInfo,
          instance: contract.instance,
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
          console.log(`applicationDragoEventful: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({applicationDragoEventful: subscriptionID});
        })
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }

  detachInterface = () => {
    const { api } = this.context;
    const { applicationDragoEventful } = this.state;
    console.log(`applicationDragoEventful: Unsubscribed to eth_blockNumber -> Subscription ID: ${applicationDragoEventful}`);
    api.unsubscribe(applicationDragoEventful).catch((error) => {
      console.warn('Unsubscribe error', error); 
    });
  } 
}
