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

import { ERRORS, validateAccount, validatePositiveNumber, cfdError, exchangeNameError } from './validation';
import * as abis from '../../contracts';
import AccountSelector from '../../Elements/elementAccountSelector';
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementDialogAddressTitle from '../../Elements/elementDialogAddressTitle'

import styles from './elementFundActionPlaceOrder.module.css';
import DragoApi from '../../DragoApi/src'

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits
const DIVISOR = 10 ** 9;  //adjustment in billionths
const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ElementFundActionPlaceOrder extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    accounts: PropTypes.array.isRequired,
    dragoDetails: PropTypes.object.isRequired,
    openActionForm: PropTypes.func.isRequired,
    snackBar: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    fromAddress: ' ',
    fromAddressError: null,
    cfd: 'default',
    cfdError: ERRORS.cfdError,
    is_stable: true,  //is_stable: {true}
    is_stableError: null,
    stake: 0,
    stakeError: ERRORS.invalidAmount,
    adjustment: 1,
    adjustmentError: null,
    exchangeName: {},
    exchangeNameError: ERRORS.exchangeNameError,
    exchangeAddress: ' ',
    value: 'default',
    assetName: null,
    assetAddress: ' ',
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

    return (
      <Dialog
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal 
        open={true}
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderHeader = () => {
    const { dragoDetails } = this.props
    return (
      <div>
          <ElementDialogHeadTitle primaryText='Place an order' />
          <ElementDialogAddressTitle tokenDetails={dragoDetails} />
      </div>

    )
  }

  onClose =(event) =>{
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event,'placeOrder')
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

    const { accountError, adjustmentError, cfdError, stakeError, is_stableError, sending } = this.state;
    const hasError = !!(adjustmentError|| accountError || cfdError || is_stableError || stakeError);

    return ([
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={ this.onClose} />,
      <FlatButton
        label='Submit'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const adjustmentLabel = 'Adjustment in billionths';
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
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <DropDownMenu
          value={this.state.value}
          onChange={this.onChangeExchange}
          >
          <MenuItem value={'default'} primaryText='Select the exchange from the list' />
          {/* <MenuItem value={'exchange2'} primaryText='CFD Exchange' /> */}
          <MenuItem value={'cfdexchange'} primaryText='CFD Exchange' />
        </DropDownMenu>
        <DropDownMenu
          value={this.state.cfd}
          onChange={this.onChangeCfd}>
          <MenuItem value={'default'} primaryText='Select the asset from the list' />
          <MenuItem value={'ethusd'} primaryText='ETHUSD' />
          {/* <MenuItem value={'ethusdcfd'} primaryText='ETHUSD²' /> */}
        </DropDownMenu>
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ adjustmentLabel }
          fullWidth
          hintText='A small adjustment for orders, set at 1 billionth of ETH as default'
          errorText={ this.state.adjustmentError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.adjustment }
          onChange={ this.onChangeAdjustment } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='The size of your stake in ETH'
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

  onChangeAddress = (account) => {
    const { api } = this.context;
      this.setState({
        account,
        accountError: validateAccount(account,api)
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
  
    onChangeCfd = (event, index, value) => {
      this.setState({
        cfd: value,
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

    onFindAsset = () => {
      const { api } = this.context;
      var dragoApi = new DragoApi(api)
      console.log(dragoApi)
      dragoApi.contract.ethusd.init()
      .then(() =>{
        this.setState({
          //loading: false,
          assetAddress: dragoApi.contract.ethusd._contract._address
        });
      })
    }

  onFindExchange = () => {
    const { dragoDetails } = this.props
    const { api } = this.context;
    var dragoApi = new DragoApi(api)
    dragoApi.contract.exchange.init()
    .then(() =>{
      return dragoApi.contract.exchange.balanceOf(ADDRESS_0, dragoDetails.address.toString())
    })
    .then ((balanceExchange) =>{
      console.log(balanceExchange)
      this.setState({
        loading: false,
        balanceExchange,
        exchangeAddress: dragoApi.contract.exchange._contract._address
      });
    })
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
    const { dragoDetails } = this.props
    const exchangeAddress = this.state.exchangeAddress;
    const cfd = this.state.assetAddress; //const cfd = api.util.toChecksumAddress(this.state.cfd);

    const is_stable = (this.state.is_stable ? this.state.is_stable.toString() : undefined); //null
    const adjustment = new BigNumber(this.state.adjustment).mul(DIVISOR);
    const stake = new BigNumber(this.state.stake).mul(DIVISOR).mul(DIVISOR);  //in units of ETH
    const values = [exchangeAddress.toString(), cfd.toString(), is_stable, adjustment.toFixed(0), stake.toFixed(0)];  //cfd.toString(),
    const options = {
      from: this.state.account.address
    };
    var dragoApi = null;

    this.setState({
      sending: true
    });
    console.log(values)
    if(this.state.account.source === 'MetaMask') {
      const web3 = window.web3
      dragoApi = new DragoApi(web3)
      dragoApi.contract.drago.init(dragoDetails.address)
      dragoApi.contract.drago.placeOrderCFDExchange(this.state.account.address, exchangeAddress.toString(), 
                                                cfd.toString(), is_stable, adjustment.toFixed(0), stake.toFixed(0))
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
      dragoApi.contract.drago.init(dragoDetails.address)
      dragoApi.contract.drago.placeOrderCFDExchange(this.state.account.address, exchangeAddress.toString(), 
                                                cfd.toString(), is_stable, adjustment.toFixed(0), stake.toFixed(0))
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
