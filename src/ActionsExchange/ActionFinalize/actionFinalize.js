// Copyright 2016-2017 Gabriele Rigo

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
const ADDRESS_0 = '0x0000000000000000000000000000000000000000';

export default class ActionFinalize extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array,
    onClose: PropTypes.func,
    cfd: PropTypes.object
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    fromAddress: ' ',
    fromAddressError: null,
    assetName: null,
    assetAddress: ' ',
    cfd: ' ',
    cfdError: null,
    tradeId: 0,
    tradeIdError: null,
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
        title='settle a deal'
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

    const { accountError, cfdError, tradeIdError, sending } = this.state;
    const hasError = !!(tradeIdError || cfdError || accountError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Finalize'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    //const { accounts } = this.props;
    //const { account, accountError, amount, amountError } = this.state;
    const assetName = this.state;

    const fromAccountLabel ='address of target drago';
    const amountLabel = 'the amount you want to deposit';
    const tradeIdLabel = 'the id of the deal you want to finalize';
    const cfdLabel = 'the cfd you want to trade';

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
          value={this.state.assetName}
          onChange={this.onChangeAsset}>
          <MenuItem value={null} primaryText='Select the asset from the list' />
          <MenuItem value={'ethusd'} primaryText='ETHUSD' />
          <MenuItem value={'ethusdcfd'} primaryText='ETHUSD²' />
        </DropDownMenu>
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ tradeIdLabel }
          fullWidth
          hintText='the id of the deal'
          errorText={ this.state.tradeIdError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.id }
          onChange={ this.onChangeTradeId } />
      </div>
    );
  }

  onChangeAddress = (account) => {
    const { api } = this.context;
    // I have added a second variable to the validateAccount to pass the api
    this.setState({
      account,
      accountError: validateAccount(account, api)
    }, this.validateTotal);
  }

  onChangeFromAccount = (event, fromAccount) => {
    this.setState({
      fromAccount,
      fromAccountError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    });
  }

  onChangeAsset = (event, index, value) => {
    this.setState({
      assetName: value,
      assetNameError: null //validateAccount(exchange)
    }, this.onFindAsset);//this.validateTotal);
  }

  onChangeCfd = (event, cfd) => {
    this.setState({
      cfd,
      cfdError: null  //validateContract
    });
  }

  onChangeTradeId = (event, tradeId) => {
    this.setState({
      tradeId,
      tradeIdError: validatePositiveNumber(tradeId)
    }, this.validateTotal);
  }

  onFindAsset = () => {
    const { api } = this.context;
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise.all([
            registry.getAddress.call({}, [api.util.sha3(this.state.assetName), 'A']) //we have to set exchange
        ]); //this.state.exchange
      })
      .then((assetAddress) => {
        console.log(`the exchange was found at ${assetAddress}`);

        this.setState({
          //loading: false,
          assetAddress
        });
      });
  }

  validateTotal = () => {
    const { account, accountError, cfd, cfdError, tradeId, tradeIdError } = this.state;

    if (accountError || cfdError || tradeIdError) {
      return;
    }

    if (new BigNumber(tradeId).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        tradeIdError: ERRORS.invalidTotal
      });
    }
  }

  onSend = () => {
    const { instance } = this.context;
    //const fromAccount = api.util.toChecksumAddress(this.state.fromAccount);
    const cfd = this.state.assetAddress; //const cfd = api.util.toChecksumAddress(this.state.cfd);
    const tradeId = new BigNumber(this.state.tradeId);
    const values = [this.state.cfd.toString(), tradeId.toFixed(0)];
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.finalize
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`finalize: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.finalize.postTransaction(options, values);
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
