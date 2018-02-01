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

import { ERRORS, validateAccount, validatePositiveNumber, tradeIdError, cfdError, exchangeNameError } from './validation';
import * as abis from '../../contracts';
import AccountSelector from '../../Elements/elementAccountSelector';
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementDialogAddressTitle from '../../Elements/elementDialogAddressTitle'

import styles from './elementFundActionFinalize.module.css';
import DragoApi from '../../DragoApi/src'

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits
const DIVISOR = 10 ** 9;  //adjustment in billionths

//TODO: add address exchange

export default class ElementFundActionFinalizeOrder extends Component {

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
    exchangeName: {},
    exchangeNameError: ERRORS.exchangeNameError,
    exchangeAddress: ' ',
    value: 'default',
    assetName: null,
    assetAddress: ' ',
    cfd: 'default',
    cfdError: ERRORS.cfdError,
    tradeId: 0,
    tradeIdError: ERRORS.tradeIdError,
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
          <ElementDialogHeadTitle primaryText='Settle a deal' />
          <ElementDialogAddressTitle tokenDetails={dragoDetails} />
      </div>

    )
  }

  onClose =(event) =>{
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event,'finalizeOrder')
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

    const { accountError, amountError, fromAddressError, cfdError, tradeIdError, sending } = this.state;
    const hasError = !!(accountError || cfdError || tradeIdError);
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
    const fromAccountLabel ='Address of target drago';
    const amountLabel = 'The amount you want to deposit';
    const tradeIdLabel = 'The ID of the order you want to cancel';
    const cfdLabel = 'The CFD you want to trade';

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
          floatingLabelText={ tradeIdLabel }
          fullWidth
          hintText='The ID of the order'
          errorText={ this.state.tradeIdError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={this.state.tradeId}
          onChange={ this.onChangeTradeId } />
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
  
    onChangeFromAccount = (event, fromAccount) => {
      this.setState({
        fromAccount,
        fromAccountError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
      });
    }

    onChangeCfd = (event, index, value) => {
      this.setState({
        cfd: value,
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
    const { api } = this.context;
    const { dragoDetails } = this.props
    const exchangeAddress = this.state.exchangeAddress;
    const cfd = this.state.assetAddress;
    const tradeId = new BigNumber(this.state.tradeId);
    const values = [exchangeAddress.toString(), cfd.toString(), tradeId.toFixed(0)];
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
      dragoApi.contract.drago.finalizeOrderCFDExchange(this.state.account.address, exchangeAddress.toString(), cfd.toString(), tradeId.toFixed(0))
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
      dragoApi.contract.drago.finalizeOrderCFDExchange(this.state.account.address, exchangeAddress.toString(), cfd.toString(), tradeId.toFixed(0))
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
