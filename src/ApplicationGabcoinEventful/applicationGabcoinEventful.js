// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';
import * as abis from '../contracts';
import styles from './application.module.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import Accounts from '../Accounts';
//import Actions, { ActionBuyIn, ActionRefund, ActionTransfer, ActionDeploy } from '../ActionsGabcoin';
//this is eventful contract only
// import { EventsGabcoin, EventsGabcoinCreated } from '../EventsGabcoin';
import { EventsGabcoin } from '../EventsGabcoin';
import Loading from '../Loading';
import Status from '../Status';

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

export default class ApplicationGabcoinEventful extends Component {

  // constructor(props) {
  //   super(props)
  //   this.state = {
  //     api: this.context.api
  //   }
  // }
  
  // Defining the properties of the context variables passed down to the children
  static childContextTypes = {
    contract: PropTypes.object,
    instance: PropTypes.object,

  };

  // Cheking type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };
  
  // Passing down the context variables to the children
  getChildContext () {
    const { contract, instance } = this.state;
    
    return {
      contract,
      instance
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
    instance: null,
    authority: null,
    loading: true,
    authority: null,
    version: null,
    subscriptionIDGabcoinEventful: null
    // api: this.context.api
    //price: null,
    //nextGabcoinID: null, //added
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
    const { accountsInfo, loading } = this.state;

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
          //nextGabcoinID={ nextGabcoinID }
          //fee={ fee }
          version={ version }
          authority={ authority }>
          <Accounts
            accounts={ accounts } />
        </Status> */}
        {/* <EventsGabcoinCreated
          accountsInfo={ accountsInfo } /> */}
        <EventsGabcoin
          accountsInfo={ accountsInfo } />
      </div>
    );
  }

/*
<EventsGabcoinCreated
  accountsInfo={ accountsInfo } />
<EventsGabcoin
  accountsInfo={ accountsInfo } />


<Actions
  gabBalance={ gabBalance }
  onAction={ this.onAction } />
*/
/*
  renderModals () {
    const { action, accounts, gabcoinName, gabcoinSymbol } = this.state;

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
        //instance.nextGabcoinID.call(),
        instance.version.call(),
        //instance.authority.call()
      ])
      .then(([version, authority/*fee, nextGabcoinID, price*/]) => {
        this.setState({
          blockNumber,
          version,
          authority
          //fee,
          //nextGabcoinID/*,
          //price*/
        });

        //const gabQueries = accounts.map((account) => instance.gabcoinOf.call({}, [account.address])); //calling instead of balanceOf()
        // const gabQueries = accounts.map((account) => api.eth.getBalance(account.address));
        // const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        const gabQueries = accounts.map((account) => {
          api.eth.getBalance(account.address)
          }
        )
        accounts.map((account) => {
          console.log('API call -> applicationGabcoinEventful: Getting balance of account', account.name);
          }
        );
        
        const ethQueries = gabQueries;

        
        return Promise.all([
          Promise.all(gabQueries),
          Promise.all(ethQueries)
        ]);
      })
      .then(([gabBalances, ethBalances]) => {
        // const { subscriptionIDGabcoinEvent } = this.state;
        // console.log(`applicationGabcoinEventful: Unsubscribed to eth_blockNumber Subscription ID: ${subscriptionIDGabcoinEvent}`);
        // api.unsubscribe(subscriptionIDGabcoinEvent);
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
            registry.getAddress.call({}, [api.util.sha3('gabcoineventful'), 'A']),
            this.getAccounts()
          ]);
      })
      .then(([address, accountsInfo]) => {
        console.log(`gabcoin eventful was found at ${address}`);

        const contract = api.newContract(abis.gabcoineventful, address);

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
          console.log(`applicationGabcoinEventful: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({subscriptionIDGabcoinEventful: subscriptionID});
        })

      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }

  detachInterface = () => {
    const { api } = this.context;
    const { subscriptionIDGabcoinEventful } = this.state;
    console.log(`applicationGabcoinEventful: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDGabcoinEventful}`);
    api.unsubscribe(subscriptionIDGabcoinEventful).catch((error) => {
      console.warn('Unsubscribe error', error); 
    });
  } 
}
