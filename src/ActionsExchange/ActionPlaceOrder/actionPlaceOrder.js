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

const DIVISOR = 10 ** 9;  //adjustment in billionths
const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000';

export default class ActionPlaceOrder extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
    //is_stable: PropTypes.bool.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array,
    onClose: PropTypes.func,
    is_stable: PropTypes.bool,
    cfd: PropTypes.object //added to static state  //maybe non an object but PropTypes.string,
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    fromAddress: ' ',
    fromAddressError: null,
    cfd: ' ',
    cfdError: null,
    is_stable: true,  //is_stable: {true}
    is_stableError: null,
    stake: 0,
    stakeError: ERRORS.invalidAmount,
    adjustment: 1,
    adjustmentError: null,
    assetName: null,
    assetAddress: ' ',
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
        title='place an order'
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

    const { accountError, adjustmentError, cfdError, stakeError, is_stableError, sending } = this.state;
    const hasError = !!(adjustmentError|| accountError || cfdError || is_stableError || stakeError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='PlaceOrder'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    //const { accounts } = this.props;
    //const { account, accountError, amount, amountError } = this.state;
    const adjustmentLabel = 'adjustment in billionths';
    const is_stableLabel = 'are you going long (stable) or short (lev)?';
    const stakeLabel = 'the amount you want to stake';
    const cfdLabel = 'the cfd you want to trade';

    const assetName = this.state;

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
          floatingLabelText={ adjustmentLabel }
          fullWidth
          hintText='a small adjustment for orders, set at 1 billionth of ETH as default'
          errorText={ this.state.adjustmentError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.adjustment }
          onChange={ this.onChangeAdjustment } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='the size of your stake'
          fullWidth
          hintText={ stakeLabel }
          errorText={ this.state.stakeError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.stake }
          onChange={ this.onChangeStake } />
        <DropDownMenu
          //errorText={ this.state.is_stableError }
          //name={ NAME_ID }
          //id={ NAME_ID }
          value={ this.state.is_stable }
          onChange={ this.onChangeStable }>
          <MenuItem primaryText='BUY LONG' />
          <MenuItem value={ true } primaryText='SELL SHORT' />
          </DropDownMenu>
      </div>
    );
  }

//<MenuItem value={ false } primaryText='SELL SHORT' /> trying without value
//USER HAS TO HAVE ENOUGH MONEY AT EXCHANGE, GIVE ERROR IF NOT ENOUGH MONEY AT EXCHANGE

//adjustment = instance.best_adjustment.call()
//automatically calculated??? double check

  onChangeAddress = (account) => {
    const { api } = this.context;
    // I have added a second variable to the validateAccount to pass the api
    this.setState({
      account,
      accountError: validateAccount(account, api)
    }, this.validateTotal);
  }

  onChangeAdjustment = (event, adjustment) => {
    this.setState({
      adjustment,
      adjustmentError: null
    });
  }

  onChangeCfd = (event, cfd) => {
    this.setState({
      cfd,
      cfdError: null  //validateContract
    });
  }

  onChangeAsset = (event, index, value) => {
    this.setState({
      assetName: value,
      assetNameError: null //validateAccount(exchange)
    }, this.onFindAsset);//this.validateTotal);
  }

  onChangeStable = (event, index, is_stable) => {
    this.setState({
      is_stable,
      is_stableError: null  //either stabe or lev, otherwise set error
    });
  }

  onChangeStake = (event, stake) => {
    this.setState({
      stake,
      stakeError: validatePositiveNumber(stake)
    }, this.validateTotal);
  }

  onFindAsset = () => {
    const { dragoAddress } = this.context;
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
    const { account, accountError, adjustment, adjustmentError, cfd, cfdError, stake, stakeError, is_stable, is_stableError } = this.state;

    if (accountError || cfdError || is_stableError || stakeError || adjustmentError) {
      return;
    }

/*
    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
  }
*/


    if (new BigNumber(stake).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
}

  onSend = () => {
    const { instance } = this.context;

    const cfd = this.state.assetAddress; //const cfd = api.util.toChecksumAddress(this.state.cfd);
    const is_stable = (this.state.is_stable ? this.state.is_stable.toString() : undefined); //null
    const adjustment = new BigNumber(this.state.adjustment).mul(DIVISOR);
    const stake = new BigNumber(this.state.stake).mul(DIVISOR).mul(DIVISOR);  //in units of ETH
    const values = [cfd.toString(), is_stable, adjustment.toFixed(0), stake.toFixed(0)];  //cfd.toString(),
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.orderCFD
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`order: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.orderCFD.postTransaction(options, values);
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
