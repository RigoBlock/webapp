// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actions.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

const DIVISOR = 10 ** 18;
const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000';

export default class ActionWithdraw extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    toAddress: ' ',
    toAddressError: null,
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
        title='withdraw to account'
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

    const { accountError, amountError, toAddressError, sending } = this.state;
    const hasError = !!(amountError || accountError || toAddressError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Withdraw'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const toAddressLabel ='address of receiver account';
    const amountLabel ='how much you want to withdraw'; //show maximum amount available
    // const maxPriceLabel = `maximum price in ETH (current ${api.util.fromWei(this.props.price).toFormat(3)})`;

    return (
      <div>
        <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='from account'
          hintText='the account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='amount in ETH'
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

/*
  <TextField
    autoComplete='off'
    floatingLabelFixed
    floatingLabelText={ toAddressLabel }
    fullWidth
    hintText='destination account'
    errorText={ this.state.toAddressError }
    name={ NAME_ID }
    id={ NAME_ID }
    value={ this.state.account }
    onChange={ this.onChangeToAddress } />
*/

  onChangeAddress = (account) => {
    const { api } = this.context;
    this.setState({
      account,
      accountError: validateAccount(account, api)
    }, this.validateTotal);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

//check for amount < deposits

  onChangeToAddress = (event, toAddress) => {
    this.setState({
      toAddress,
      toAddressError: null //validateAccount(toAddress) //create validateContract(toAddress)
    });
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError, toAddress, toAddressError } = this.state;

    if (accountError || amountError || toAddressError) {
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
    //const toAddress = this.state.toAddress.toString();
    // const maxPrice = api.util.toWei(this.state.maxPrice);
    //const values = [this.state.account.address, toAddress];
    const amount = new BigNumber(this.state.amount).mul(DIVISOR);
    const { api } = this.context;
    
    const toAddress = api.util.toChecksumAddress(this.state.toAddress);

    const values = [ADDRESS_0, amount.toFixed(0)]; // [this.state.toAddress]; //amount.toFixed(0)
    const options = {
      from: this.state.account.address
      //value: api.util.toWei(this.state.amount).toString()
    };

    this.setState({
      sending: true
    });

    instance.withdraw
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas =  gasEstimate.mul(1.2).toFixed(0); //problem with estimate cause of blank before toAddress
        console.log(`buyin: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.withdraw.postTransaction(options, values);
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
