// Copyright 2016-2017 Gabriele Rigo

import * as abis from '../../contracts';

// import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actionsGabcoin.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

const DIVISOR = 10 ** 6;  //gabcoins are divisible by 1 million
const NAME_ID = ' ';

export default class ActionSellGabcoin extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
    //instance: PropTypes.object.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array,
    //price: PropTypes.object,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    complete: false,
    sending: false,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    gabcoinName: ' ',
    gabcoinNameError: null,
    gabcoinSymbol: ' ',
    gabcoinSymbolError: null,
    contract: ' ',
    contractError: null, //check for contract or instance ERRORS
    instance: ' ',
    instanceError: null,
    //price: api.util.fromWei(this.props.price).toString(),
    //priceError: null
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
        title='sell your vault for ETH'
        modal open
        className={ styles.dialog }
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderActions () {
    if (this.state.complete) {
      return (
        <FlatButton
          className={ styles.dlgbtn }
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

//    const hasError = !!(this.state.gabcoinAddressError || this.state.amountError || this.state.accountError);

    const { accountError, amountError, gabcoinNameError, gabcoinSymbolError, gabcoinError, sending } = this.state;
    const hasError = !!(this.state.amountError || this.state.accountError || this.state.gabcoinNameError || this.state.gabcoinSymbolError || this.state.gabcoinError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='SellVault'
        primary
        disabled={ hasError || this.state.sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const gabcoinNameLabel ='search your target vault';
    const gabcoinSymbolLabel ='let us avoid typos!';
    const gabcoinAddress = 'address of target vault';
    //const priceLabel = `price in ETH (current ${api.util.fromWei(this.props.price).toFormat(3)})`;

    return (
      <div>
        <AccountSelector
          //gabBalance
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='from account'
          hintText='the account the transaction will be made from'
          onSelect={ this.onChangeAccount } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ gabcoinNameLabel }
          fullWidth
          hintText='the name of the vault you are looking for'
          errorText={ this.state.gabcoinNameError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeGabcoinName } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ gabcoinSymbolLabel }
          fullWidth
          hintText='the symbol of the vault you are looking for'
          errorText={ this.state.gabcoinSymbolError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeGabcoinSymbol } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='number of tokens'
          fullWidth
          hintText='the number of tokens to exchange for an ETH refund'
          errorText={ this.state.amountError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.amount }
          onChange={ this.onChangeAmount } />
      </div>
    );
  }

  onChangeAccount = (account) => {
    this.setState({
      account,
      accountError: validateAccount(account)
    });
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    });
  }

  onChangeGabcoinName = (event, gabcoinName) => {
    this.setState({
      gabcoinName,
      gabcoinNameError: null //validateAccount(gabcoinAddress) //create validateContract(gabcoinAddress)
    }, this.onFindGabcoinAddress);
  }

  onChangeGabcoinSymbol = (event, gabcoinSymbol) => {
    this.setState({
      gabcoinSymbol,
      gabcoinSymbolError: null //validateAccount(gabcoinAddress) //create validateContract(gabcoinAddress)
    }, this.onFindGabcoinAddress);
  }

  onFindGabcoinAddress = () => {
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
            dragoRegistry.fromNameSymbol.call({}, [this.state.gabcoinName.toString(), this.state.gabcoinSymbol.toString()])
        ])
        .then((gabcoinAddress) => {

          console.log(`length of object array ${gabcoinAddress.length}`)

          const gabcoin = api.newContract(abis.gabcoin, gabcoinAddress);

          this.setState({
            gabcoinAddress,
            gabcoin,
            instance : gabcoin.instance
          })

          console.log(`your target gabcoin was found at ${gabcoinAddress}`);
        });
      });
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError, gabcoinName, gabcoinNameError, gabcoinSymbolError } = this.state;

    if (accountError || amountError || gabcoinNameError || gabcoinSymbolError) {
      return;
    }

    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
  }

  onSend = () => {
    //const { instance } = this.context;
    const instance = this.state.instance;

    //const gabcoinAddress = api.util.toChecksumAddress(this.state.gabcoinAddress);
    //const price = api.util.toWei(this.state.price);
    const amount = new BigNumber(this.state.amount).mul(DIVISOR);
    const values = [amount.toFixed(0)];
    const options = {
      from: this.state.account.address
    };
    const { api } = this.context;
    
    this.setState({
      sending: true
    });

    instance.sellGabcoin
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);  //problem with estimate cause of blank before gabcoinAddress
        console.log(`refund: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.sellGabcoin.postTransaction(options, values);
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
