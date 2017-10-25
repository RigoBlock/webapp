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

//TODO: add address exchange
//create separate component for selecting exchanges and one for assets

export default class ActionDragoPlaceOrder extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired,
    dragoAddress: PropTypes.object.isRequired,
    api: PropTypes.object
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
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    exchangeAddress: ' ',
    value: 'default',
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

    const value = this.state;
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
          value={this.state.value}
          onChange={this.onChangeExchange}
          //style={styles.customWidth}
          //autoWidth={false}
          >
          <MenuItem value={'default'} primaryText='Select the exchange from the list' />
          <MenuItem value={'exchange2'} primaryText='CFD Exchange' />
          <MenuItem value={'cfdexchange'} primaryText='ERC20 Exchange' />
        </DropDownMenu>
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

  onChangeAsset = (event, index, value) => {
    this.setState({
      assetName: value,
      assetNameError: null //validateAccount(exchange)
    }, this.onFindAsset);//this.validateTotal);
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

  //an alternative is to create a list of assets traded on the exchange, and map throug a promise in onFindExchange
  onFindAsset = () => {
    const { dragoAddress } = this.context;

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

    const exchangeAddress = this.state.exchangeAddress;
    const cfd = this.state.assetAddress; //const cfd = api.util.toChecksumAddress(this.state.cfd);

    const is_stable = (this.state.is_stable ? this.state.is_stable.toString() : undefined); //null
    const adjustment = new BigNumber(this.state.adjustment).mul(DIVISOR);
    const stake = new BigNumber(this.state.stake).mul(DIVISOR).mul(DIVISOR);  //in units of ETH
    const values = [exchangeAddress.toString(), cfd.toString(), is_stable, adjustment.toFixed(0), stake.toFixed(0)];  //cfd.toString(),
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.placeOrderCFDExchange
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`order: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.placeOrderCFDExchange.postTransaction(options, values);
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
