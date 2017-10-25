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

//TODO: exchange and asset select from separate component

export default class ActionDragoCancelOrder extends Component {
  static contextTypes = {
    // instance: PropTypes.object.isRequired,
    // dragoAddress: PropTypes.object.isRequired
    api: PropTypes.object
  }

  static propTypes = {
    accounts: PropTypes.array,
    onClose: PropTypes.func,
    cfd: PropTypes.object
  }

//function cancel(uint32 id)

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    fromAddress: ' ',
    fromAddressError: null,
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    exchangeAddress: ' ',
    value: 'default',
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
        title='cancel an open order'
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

    const { accountError, amountError, fromAddressError, cfdError, tradeIdError, sending } = this.state;
    const hasError = !!(accountError || cfdError || tradeIdError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='CancelOrder'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

//modify condition when_has_order or place in order list of user

  renderFields () {
    //const { accounts } = this.props;
    //const { account, accountError, amount, amountError } = this.state;
    const fromAccountLabel ='address of target drago';
    const amountLabel = 'the amount you want to deposit';
    const tradeIdLabel = 'the id of the order you want to cancel';
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
          floatingLabelText={ tradeIdLabel }
          fullWidth
          hintText='the id of the order'
          errorText={ this.state.tradeIdError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.id }
          onChange={ this.onChangeTradeId } />
      </div>
    );
  }

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

  onChangeFromAccount = (event, fromAccount) => {
    this.setState({
      fromAccount,
      fromAccountError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    });
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

  //an alternative is to create a list of assets traded on the exchange, and map throug a promise in onFindExchange
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

    const exchangeAddress = this.state.exchangeAddress;
    const cfd = this.state.assetAddress;
    //const cfd = api.util.toChecksumAddress(this.state.cfd);

    const tradeId = new BigNumber(this.state.tradeId);
    const values = [exchangeAddress.toString(), cfd.toString(), tradeId.toFixed(0)];
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.cancelOrderCFDExchange
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`cancel: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.cancelOrderCFDExchange.postTransaction(options, values);
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
