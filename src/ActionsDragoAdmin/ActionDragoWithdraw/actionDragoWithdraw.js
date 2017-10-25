// Copyright 2016-2017 Gabriele Rigo

import * as abis from '../../contracts';

import { api } from '../../parity';
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

const DIVISOR = 10 ** 18;
const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000';

//TODO: add address exchange
const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to add a component for exchange injection

export default class ActionDragoWithdraw extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired,
    dragoAddress: PropTypes.object.isRequired,
    api: PropTypes.object
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
    approvedExchange: APPROVED_EXCHANGES,
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    exchangeAddress: ' ',
    value: 'default',
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
    const value = this.state;

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
    this.setState({
      account,
      accountError: validateAccount(account)
    }, this.validateTotal);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  onChangeExchange = (event, index, value) => {
    this.setState({
      value,
      exchangeName: value,
      exchangeNameError: null //validateAccount(exchange)
    }, this.onFindExchange);//this.validateTotal);
  }

//check for amount < deposits

  onChangeToAddress = (event, toAddress) => {
    this.setState({
      toAddress,
      toAddressError: null //validateAccount(toAddress) //create validateContract(toAddress)
    });
  }

  onFindExchange = () => {
    const { dragoAddress } = this.context;
    const { api } = this.context;
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

    const exchangeAddress = this.state.exchangeAddress;
    const amount = new BigNumber(this.state.amount).mul(DIVISOR);
    const toAddress = api.util.toChecksumAddress(this.state.toAddress);

    const values = [exchangeAddress.toString(), ADDRESS_0, amount.toFixed(0)];
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.withdrawFromExchange
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas =  gasEstimate.mul(1.2).toFixed(0); //problem with estimate cause of blank before toAddress
        console.log(`buyin: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.withdrawFromExchange.postTransaction(options, values);
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
