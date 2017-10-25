// Copyright 2016-2017 Gabriele Rigo

//import { approvedExchanges } from '../../ApprovedExchanges';

import * as abis from '../../contracts';

// import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actions.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits

const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ActionDragoDeposit extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired, //instance arrives from application, here we have to find exchanges and assets
    //approvedExchanges: PropTypes.array.isRequired
    dragoAddress: PropTypes.object.isRequired,
    api: PropTypes.object
  }

  static propTypes = {
    //approvedExchanges: PropTypes.array,
    accounts: PropTypes.array,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    approvedExchange: APPROVED_EXCHANGES,
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    exchangeAddress: ' ',
    value: 'default',
    //fromAddress: ' ',
    //fromAddressError: null,
    sending: false,
    complete: false
  }

  render () {
    const { complete } = this.state;

    if (complete) {
      return null;
    }

    return (
      <Dialog
        title='deposit to the exchange'
        modal open
        className={ styles.dialog }
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderActions () {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton
          className={ styles.dlgbtn }
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { accountError, amountError, /*fromAddressError, */exchangeNameError, sending } = this.state;
    const hasError = !!(amountError || accountError || exchangeNameError/* || fromAddressError*/);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Deposit'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {

    //const { approvedExchanges } = this.state;
    //const { approvedExchanges } = this.state.approvedExchanges;
    const value = this.state;

    //const { accounts } = this.props; //these were blocked
    //const { account, accountError, amount, amountError } = this.state; //these were blocked
    //const fromAddressLabel ='address of your account';
    const amountLabel = 'the amount you want to deposit';

    return (
      <div>
        <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='from account'
          hintText='the account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <DropDownMenu
          value={this.state.value}
          onChange={this.onChangeExchange}
          //style={styles.customWidth}
          //autoWidth={false}
          >
          <MenuItem value={'default'} primaryText='Select the exchange from the list' />
          <MenuItem value={'exchange2'} primaryText='CFD Exchange' />
          <MenuItem value={'cfdexchange'} primaryText='ERC20 Exchange' />
        </DropDownMenu>
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='amount you want to deposit'
          fullWidth
          hintText={ amountLabel }
          errorText={ this.state.amountError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.amount }
          onChange={ this.onChangeAmount } />
      </div>
    );
  }

// autoComplete='off'
/*

<AccountSelector
  accounts={ approvedExchanges }
  //account={ this.state.account }
  //errorText={ this.state.accountError }
  floatingLabelText='from account'
  hintText='the account the transaction will be made from'
  onSelect={ this.onChangeExchange } />

This has to be set when we have a list of items, otherwise it crashes the application
*/
  onChangeAddress = (account) => {
    this.setState({
      account,
      accountError: validateAccount(account)
    }, this.validateTotal);
  }

  onChangeExchange = (event, index, value) => {
    this.setState({
      value,
      exchangeName: value,
      exchangeNameError: null //validateAccount(exchange)
    }, this.onFindExchange);//this.validateTotal);
  }
/*
  onChangeFromAddress = (event, fromAddress) => {
    this.setState({
      fromAddress,
      fromAddressError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    });
  }
*/
  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  onFindExchange = () => {
    const { dragoAddress } = this.context;

    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise.all([
            registry.getAddress.call({}, [api.util.sha3(this.state.exchangeName), 'A']) //we have to set exchange
        ]); //this.state.exchange
      })
      .then((exchangeAddress) => {
        console.log(`the exchange was found at ${exchangeAddress}`);

        this.setState({
          exchangeAddress
        });

        const targetExchange = api.newContract(abis.exchange, exchangeAddress).instance;

        return Promise.all([
            //dragoRegistry.fromName.call({}, ['martinuz'.toString()]) //this function would return
                    //an object with comma separated values and react cannot split [1], the second value
                    // then(([id, dragoAddress, dragoSymbol, dragoID, dragoOwner, dragoGroup]) => {})
                    //https://www.npmjs.com/package/comma-separated-values might help for getting groups
                    //for now implemented in solidity and added extra security as performs symbol check!
            //dragoRegistry.fromNameSymbol.call({}, ['firstdrago'.toString(), 'fst'.toString()])
            targetExchange.balanceOf.call({}, [ADDRESS_0, dragoAddress.toString()])
        ])
        .then(([balanceExchange]) => {

          console.log(`length of object array ${balanceExchange.length}`)

          this.setState({
            loading: false,
            balanceExchange
          });

          console.log(`drago balance at exchange ${balanceExchange}`)

          //api.subscribe('eth_blockNumber', this.onNewBlockNumber); //let's not overload the application
        })
        .catch((error) => {
        console.warn('findExchange', error);

        //this.attachInterface(); //this is new
        });
      });
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError/*, fromAddress, fromAddressError, exchange, exchangeError*/ } = this.state;

    if (accountError || amountError /*|| exchangeError || fromAddressError*/) {
      return;
    }

    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
  }

  onSend = () => {
    const { instance } = this.context;
    //const deposit0 = new BigNumber(0);
    //const deposit0 = api.util.toWei(this.state.amount);
    const exchangeAddress = this.state.exchangeAddress; //cfd exchange; //this.state.exchange;
    //const account0 = api.util.toChecksumAddress(0);
    //const fromAddress =  api.util.toChecksumAddress(this.state.fromAddress); //amended cause it required changing the address to work
    const values = [exchangeAddress.toString(), ADDRESS_0, api.util.toWei(this.state.amount).toString()]; //this.state.account.address
    const options = {
      from: this.state.account.address//,
      //value: api.util.toWei(this.state.amount).toString() //this function is not payable!!
    };

    this.setState({
      sending: true
    });

    instance.depositToExchange
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`deposit: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.depositToExchange.postTransaction(options, values);
      })
      .then(() => {
        this.props.onClose();
        this.setState({
          sending: false,
          complete: true
        });
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        });
      });
  }
}
