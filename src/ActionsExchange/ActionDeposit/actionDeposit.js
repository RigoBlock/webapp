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

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits

export default class ActionDeposit extends Component {
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
    fromAddress: ' ',
    fromAddressError: null,
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

    const { accountError, amountError, fromAddressError, sending } = this.state;
    const hasError = !!(amountError || accountError || fromAddressError);

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
    //const { accounts } = this.props;
    //const { account, accountError, amount, amountError } = this.state;
    const fromAddressLabel ='address of your account';
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
        <TextField
          autoComplete='on'
          floatingLabelFixed
          floatingLabelText={ fromAddressLabel }
          fullWidth
          hintText='the address from where to deposit'
          errorText={ this.state.fromAddressError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.account.address }
          onChange={ this.onChangeFromAddress } />
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

  // validateAccount (account) {
  //   // console.log(api)
  //   // // console.log(context);
  //   // console.log(account);
  //   const { api } = this.context;
  //   console.log(api);
  //   if (!account || !account.address) {
  //     return ERRORS.invalidAccount;
  //   }

  //   if (!api.util.isAddressValid(account.address)) {
  //     return ERRORS.invalidAddress;
  //   }

  //   account.address = api.util.toChecksumAddress(account.address);

  //   return null;
  // }

  onChangeAddress = (account) => {
    const { api } = this.context;
    // I have added a second variable to the validateAccount to pass the api
    this.setState({
      account,
      accountError: validateAccount(account, api)
    }, this.validateTotal);
  }

  onChangeFromAddress = (event, fromAddress) => {
    this.setState({
      fromAddress,
      fromAddressError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    });
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError, fromAddress, fromAddressError } = this.state;

    if (accountError || amountError || fromAddressError) {
      return;
    }

    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
  }

  onSend = () => {
    const { api } = this.context;
    const { instance } = this.context;
    //const deposit0 = new BigNumber(0);
    //const deposit0 = api.util.toWei(this.state.amount);
    //const account0 = api.util.toChecksumAddress(0);
    //const fromAddress =  api.util.toChecksumAddress(this.state.fromAddress); //amended cause it required changing the address to work
    const values = [ADDRESS_0, api.util.toWei(this.state.amount).toString()]; //this.state.account.address
    const options = {
      from: this.state.account.address,
      value: api.util.toWei(this.state.amount).toString()
    };

    this.setState({
      sending: true
    });

    instance.deposit
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`deposit: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.deposit.postTransaction(options, values);
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
