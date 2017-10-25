// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actionsGabcoin.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

const NAME_ID = ' ';

export default class ActionDeploy extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
  //  amount: 0,
  //  amountError: ERRORS.invalidAmount,
    dragoName: ' ',
    dragoNameError: null,
    dragoSymbol: ' ',
    dragoSymbolError: null,
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
        title='deploy dragos for a specific account'
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

    const { accountError, dragoNameError, dragoSymbolError, sending } = this.state;
    const hasError = !!(dragoNameError || accountError || dragoSymbolError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Deploy'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const nameLabel = 'the name of your brand new drago';
    const symbolLabel = 'the symbol of your brand new drago';

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
          floatingLabelText={ nameLabel }
          fullWidth
          hintText='MyBrandNewDrago'
          errorText={ this.state.dragoNameError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.dragoName }  alt: floatingLabelText
          onChange={ this.onChangeName } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ symbolLabel }
          fullWidth
          hintText='MyNewDragoSymbol'
          errorText={ this.state.dragoSymbolError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.dragoSymbol }  alt: floatingLabelText
          onChange={ this.onChangeSymbol } />
      </div>
    );
  }

  onChangeAddress = (account) => {
    this.setState({
      account,
      accountError: validateAccount(account)
    }, this.validateTotal);
  }

  onChangeName = (event, dragoName) => {
    this.setState({
      dragoName,
      dragoNameError: null  //validateNewName(dragoName)
    }, this.validateTotal);
  }

  onChangeSymbol = (event, dragoSymbol) => {
    this.setState({
      dragoSymbol,
      dragoSymbolError: null  //validateNewSymbol(dragoSymbol)
    });
  }

  validateTotal = () => {
    const { account, accountError, dragoName, dragoNameError, dragoSymbol, dragoSymbolError } = this.state;

    if (accountError || dragoNameError || dragoSymbolError) {
      return;
    }

/*    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
    */
  }


  onSend = () => {
    const { instance } = this.context;
    const dragoName = this.state.dragoName.toString();
    const dragoSymbol = this.state.dragoSymbol.toString();
    //const values = [this.state.account.address, MAX_PRICE];
    const values = [dragoName, dragoSymbol];
    const options = {
      from: this.state.account.address
    //,  value: api.util.toWei(this.state.amount).toString()
    };
    const { api } = this.context;

    this.setState({
      sending: true
    });

    instance.createHumanStandardDragoo
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`deploy: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.createHumanStandardDragoo.postTransaction(options, values);
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
