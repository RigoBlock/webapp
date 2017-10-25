// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import * as abis from '../contracts';

import Accounts from '../Accounts';
import { ActionsDragoAdmin, ActionDragoWithdraw, ActionDragoCancelOrder, ActionDragoPlaceOrder, ActionDragoFinalize, ActionDragoDeposit } from '../ActionsDragoAdmin';

//import EventsExchange from '../EventsExchange';
//import EventsDeposits, { EventsWithdraws, EventsOrdersPlaced, EventsOrdersCancelled, EventsMatched, EventsFinalized } from '../EventsExchange';

import Loading from '../Loading';
import Status from '../Status';

import styles from './application.module.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import { Dialog, FlatButton, TextField } from 'material-ui';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 18;  // calculations in ETH
const NAME_ID = ' ';

export default class ApplicationDragoAdmin extends Component {
  
  static contextTypes = {
    //instance: PropTypes.object.isRequired
    //drago: PropTypes.object,
    //instance: PropTypes.object,
    api: PropTypes.object
  }

  static childContextTypes = {
    api: PropTypes.object,
    //dragoAddress: PropTypes.object,
    drago: PropTypes.object,
    dragoAddress: PropTypes.string, //dragoAddress: PropTypes.object,
    instance: PropTypes.object, //instance: PropTypes.object, //moved into contextTypes
    //allEvents: PropTypes.object,
    muiTheme: PropTypes.object
  };

  getChildContext () {
    const { /*allEvents, */dragoName, dragoSymbol, dragoAddress, instance } = this.state;
    //const { allEvents } = this.props;

    return {
      // api,
      dragoAddress,
      instance,
      //drago,
      //allEvents,
      muiTheme
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
    dragoAddress: ' ',
    drago: ' ',
    dragoError: null,
    instance: ' ',
    instanceError: null,
    loading: true,
    //price: null,
    authority: null,
    dragoName: ' ',
    dragoNameError: null,
    dragoSymbol: ' ',
    dragoSymbolError: null
    //next_id: null, //added
    //min_stake: null, //added
    //remaining: null,
    //totalSupply: null
  }
/*
  componentDidMount () {
    this.attachInterface();
  }
*/

  render () {
    const { /*allEvents, */accounts, accountsInfo, address, blockNumber, gabBalance, loading, dragoName, dragoSymbol } = this.state;

    const dragoNameLabel ='Your target drago';
    const dragoSymbolLabel ='And input the symbol!';
/*
    if (loading) {
      return (
        <Loading />
      );
    }
*/
    return (
      <div className={ styles.body } style={ bgstyle }>
        <TextField
          autoComplete='off'
          //floatingLabelFixed
          floatingLabelText={ dragoNameLabel }
          fullWidth
          //hintText='the name of the drago you are looking for'
          errorText={ this.state.dragoNameError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeDragoName } />
        <TextField
          autoComplete='off'
          //floatingLabelFixed
          floatingLabelText={ dragoSymbolLabel }
          fullWidth
          //hintText='the symbol of the drago you are looking for'
          errorText={ this.state.dragoSymbolError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeDragoSymbol } />
        { this.renderModals() }
        <ActionsDragoAdmin
          gabBalance={ gabBalance }
          onAction={ this.onAction } />
      </div>
    );
  }

  onChangeDragoName = (event, dragoName) => {
    this.setState({
      dragoName,
      dragoNameError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    }, this.onFindDragoAddress);
  }

  onChangeDragoSymbol = (event, dragoSymbol) => {
    this.setState({
      dragoSymbol,
      dragoSymbolError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    }, this.onFindDragoAddress);
  }

  onFindDragoAddress = () => {
    const { api } = this.context;
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise.all([
            registry.getAddress.call({}, [api.util.sha3('dragoregistry'), 'A'])
        ]);
      })
      .then((address) => {
        console.log(`the drago registry was found at ${address}`);

        const dragoRegistry = api.newContract(abis.dragoregistry, address).instance;

        return Promise.all([
            //dragoRegistry.fromName.call({}, ['martinuz'.toString()]) //this function would return
                    //an object with comma separated values and react cannot split [1], the second value
                    // then(([id, dragoAddress, dragoSymbol, dragoID, dragoOwner, dragoGroup]) => {})
                    //https://www.npmjs.com/package/comma-separated-values might help for getting groups
                    //for now implemented in solidity and added extra security as performs symbol check!
            //dragoRegistry.fromNameSymbol.call({}, ['firstdrago'.toString(), 'fst'.toString()])
            dragoRegistry.fromNameSymbol.call({}, [this.state.dragoName.toString(), this.state.dragoSymbol.toString()]),
            this.getAccounts()
        ])
        .then(([dragoAddress, accountsInfo]) => {

          console.log(`length of object array ${dragoAddress.length}`)

          const drago = api.newContract(abis.drago, dragoAddress);

          this.setState({
            loading: false,
            dragoAddress,
            drago,
            instance : drago.instance,
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
          console.log(drago.instance);
          console.log(`your target drago was found at ${dragoAddress}`)

          api.subscribe('eth_blockNumber', this.onNewBlockNumber);
        })
        .catch((error) => {
        console.warn('findDragoAddress', error);

        //this.attachInterface(); //this is new
        });
      });
  }

  validateTotal = () => {
    const { dragoName, dragoNameError, dragoSymbol, dragoSymbolError } = this.state;

    if (dragoNameError || dragoSymbolError) {
      return;
    }
  }
/*

function fromName(string _name) constant returns (uint id, address drago, string symbol, uint dragoID, address owner, address group) {
		id = mapFromName[_name] - 1;
		var t = dragos[id];
		symbol = t.symbol;
		drago = t.drago;
		dragoID = t.dragoID;
		owner = t.owner;
		group = t.group;
	}

look for in events how fo JSON.stringify JSON.parse
*/


  renderModals () {
    //const { instance } = this.context;
    const { instance } = this.state.instance;

    const { action, accounts, dragoName, dragoSymbol } = this.state;

    switch (action) {
      case 'DragoWithdraw':
        return (
          <ActionDragoWithdraw
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'DragoPlaceOrder':
        return (
          <ActionDragoPlaceOrder
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'DragoCancelOrder':
        return (
          <ActionDragoCancelOrder
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      case 'DragoDeposit':
        return (
          <ActionDragoDeposit
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      case 'DragoFinalize':
        return (
          <ActionDragoFinalize
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
    const { api } = this.context;
    const { instance, accounts } = this.state;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
      //  instance.min_stake.call(),
        instance.getEventful.call()
      //  instance.next_id.call(),
      //  instance.price.call()
      ])
      .then(([eventful]) => {
        this.setState({
          blockNumber,
          eventful
        });

        //gabQueries is amended sees account(0) as undefined //ToBeFixed
        //fix: tokens[0][_who]  //amend deposit functions
        const gabQueries = accounts.map((account) => instance.balanceOf.call({}, [account.address]));
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        accounts.map((account) => {
          console.log('API call getBalance -> applicationDragoAdmin: Getting balance of account', account.name);
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
/*
  attachInterface = () => {
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

        api.subscribe('eth_blockNumber', this.onNewBlockNumber);
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }*/
}
