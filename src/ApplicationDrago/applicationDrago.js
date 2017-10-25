// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import * as abis from '../contracts';

import Accounts from '../Accounts';
import { ActionsDrago, ActionBuyDrago, ActionSellDrago /*ActionTransfer, ActionDeploy*/ } from '../ActionsDrago';
//import ApplicationDragoFactory from '../ApplicationDragoFactory'; //action deploy comes from application dragoFactory
//import Events from '../Events';
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDrago.module.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 6;  //tokens are divisible by one million

export default class ApplicationDrago extends Component {

  // Defining the properties of the context variables passed down to the children
  static childContextTypes = {
    contract: PropTypes.object,
    // instance: PropTypes.object,

  };

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };
  
  // Passing down the context variables to the children
  getChildContext () {

    
    return {
      
    };
  }

  state = {
    action: null,
    address: null,
    accounts: [],
    accountsInfo: {},
    blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    gabBalance: new BigNumber(0),
    //instance: null,
    loading: true,
    subscriptionIDDrago: null,
    //dragoName: 'martinuz',
    //price: null,
    //eventful: null
    //version: null, //not a public variable on .sol
    //base: null //not a public variable in .sol
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
    const { accounts, accountsInfo, address, blockNumber, gabBalance, loading, eventful } = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <div className={ styles.body } style={ bgstyle }>
        { this.renderModals() }
        {/* <Status
          address={ address }
          blockNumber={ blockNumber }
          gabBalance={ gabBalance }
          //price={ price }
          //remaining={ remaining }
          //base={ base }
          //version={ version }
          gabBalance={ gabBalance }>
          <Accounts
            accounts={ accounts } />
        </Status> */}
        <ActionsDrago
          gabBalance={ gabBalance }
          onAction={ this.onAction } />
      </div>
    );
  }

/*
<Events
  accountsInfo={ accountsInfo } />
*/

  renderModals () {
    const { action, accounts } = this.state;

    switch (action) {
      case 'BuyDrago':
        return (
          <ActionBuyDrago
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'SellDrago':
        return (
          <ActionSellDrago
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      /*case 'Transfer':
        return (
          <ActionTransfer
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );*/
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

//the following function should be used in drago status application, user has to select her own drago
//think about creating component FindDragoFromNameSymbol  and then use it in the different parts of the dapp

  onNewBlockNumber = (_error, blockNumber) => {
    const { /*instance,*/ accounts } = this.state;
    const { api } = this.context;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
        //instance.getEventful.call()//,
        //instance.getData.call([1]) //[1] returns name, symbol, sellPrice, buyPrice, totalSupply
        //instance.getAdminData.call(), //[1] feeCollector, dragodAO, ratio, transactionFee, minPeriod
        //these values can then be passed to admin (status)
      ])
      .then(([eventful]) => {
        this.setState({
          blockNumber
          //eventful
          //version,
          //base
          //fee,
          //nextDragoID
        });

        //const gabQueries = accounts.map((account) => instance.balanceOf.call({}, [account.address]));
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        accounts.map((account) => {
          console.log('API call getBalance -> applicationDrago: Getting balance of account', account.name);
          }
        )
        return Promise.all([
          //Promise.all(gabQueries),
          Promise.all(ethQueries)
        ]);
      })
      .then(([/*gabBalances, */ethBalances]) => {
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          //gabBalance: gabBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            //const gabBalance = gabBalances[index];

            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            //account.gabBalance = gabBalance.div(DIVISOR).toFormat(6);
            //account.hasGab = gabBalance.gt(0);

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

        //const registry = api.newContract(abis.registry, registryAddress).instance;
        //const dragoRegistry = api.newContract(abis.dragoregistry, registryAddress).instance;
        //we have to define registry, then look for dragoregistry address (in Promise)
        //and then we can call for lookup drago name in drago registry

        return Promise
          .all([ //{this.GithubHint.entries(this.bond)[0]}
            //registry.getAddress.call({}, [api.util.sha3('newdrago'), 'A']),
            //dragoRegistry.fromName.call({}, [api.util.sha3(this.state.dragoName)][1]),
            //dragoRegistry.fromName.call({}, [api.util.sha3('martinuz')][1]), //temporary suspended to check with address
            this.getAccounts() //THIS FUNCTION RETURNS THE ACCOUNTS OF THE USER
          ]);
      })
      .then(([/*address, */accountsInfo]) => {
        //console.log(`your target drago was found at ${address}`);

        //const contract = api.newContract(abis.drago, address);

        this.setState({
          loading: false,
          //address,
          //contract,
          accountsInfo,
          //instance: contract.instance,
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
          console.log(`applicationDrago: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({subscriptionIDDrago: subscriptionID});
        })
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }

  detachInterface = () => {
    const { subscriptionIDDrago } = this.state;
    const { api } = this.context;
    console.log(`applicationDrago: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDDrago}`);
    api.unsubscribe(subscriptionIDDrago).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
  } 
}
