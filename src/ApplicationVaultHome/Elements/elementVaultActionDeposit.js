// Copyright 2016-2017 Rigo Investment Sarl.

import { Dialog, FlatButton, TextField } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import IdentityIcon from '../../IdentityIcon';
import  * as Colors from 'material-ui/styles/colors';

import { ERRORS, validateAccount, validatePositiveNumber } from './validation';
import * as abis from '../../contracts';
import AccountSelector from '../../Elements/elementAccountSelector';
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementDialogAddressTitle from '../../Elements/elementDialogAddressTitle'

import styles from './elementVaultActionDeposit.module.css';
import DragoApi from '../../DragoApi/src'

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits

const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ElementVaultActionDeposit extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    accounts: PropTypes.array.isRequired,
    vaultDetails: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    snackBar: PropTypes.func
  }

  state = {
    open: this.props.open,
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    value: 'default',
    sending: false,
    complete: false
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }

  render () {
    const { complete } = this.state;

    if (complete) {
      return null;
    }

    const titleStyle = {
      padding: 0,
      lineHeight: '20px',
      fontSize: 16
    }
    console.log(this.props)
    return (
      <Dialog
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal 
        open={this.props.open}
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderHeader = () => {
    const { vaultDetails } = this.props
    return (
      <div>
          <ElementDialogHeadTitle primaryText='Deposit to vault' />
          <ElementDialogAddressTitle tokenDetails={vaultDetails} />
      </div>

    )
  }

  onClose =(event) =>{
    this.setState({
      open: false
    });
  }

  renderActions () {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { accountError, amountError, sending } = this.state;
    const hasError = !!(amountError || accountError);

    return ([
      <FlatButton
        label='Cancel'
        name='deposit'
        primary
        onTouchTap={ this.onClose} />,
      <FlatButton
        label='Deposit'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const value = this.state;
    const amountLabel = 'The amount you want to deposit';

    return (
      <div>
        <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='Amount you want to deposit'
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

  onChangeAddress = (account) => {
	const { api } = this.context;
    this.setState({
      account,
      accountError: validateAccount(account,api)
    }, this.validateTotal);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError } = this.state;

    if (accountError || amountError) {
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
    const { vaultDetails } = this.props
    // const { instance } = this.context;
    const exchangeAddress = this.state.exchangeAddress; //cfd exchange; //this.state.exchange;
    const values = [exchangeAddress.toString(), ADDRESS_0, api.util.toWei(this.state.amount).toString()]; //this.state.account.address
    const options = {
      from: this.state.account.address
    };
    var dragoApi = null;

    this.setState({
      sending: true
    });
    if(this.state.account.source === 'MetaMask') {
      const web3 = window.web3
      dragoApi = new DragoApi(web3)
      dragoApi.contract.drago.init(vaultDetails.address)
      dragoApi.contract.drago.depositToExchange(this.state.account.address, exchangeAddress.toString(), 
                                                ADDRESS_0, api.util.toWei(this.state.amount).toString())
      .then ((result) =>{
        console.log(result)
        this.setState({
          sending: false
        });
      })
      .catch((error) => {
        console.error('error', error)
        this.setState({
          sending: false
        })
      })
      this.onClose()
      this.props.snackBar('Deposit awaiting for authorization')
    } else {
      dragoApi = new DragoApi(api)
      dragoApi.contract.drago.init(vaultDetails.address)
      dragoApi.contract.drago.depositToExchange(this.state.account.address, exchangeAddress.toString(), 
                                                ADDRESS_0, api.util.toWei(this.state.amount).toString())
      .then((result) => {
        this.onClose()
        this.props.snackBar('Deposit awaiting for authorization')
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        })
      })
    }
  }
}
