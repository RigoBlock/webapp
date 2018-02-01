// Copyright 2016-2017 Rigo Investment Sarl.

import  * as Colors from 'material-ui/styles/colors';
import { Dialog, FlatButton, TextField } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AppBar from 'material-ui/AppBar';
import BigNumber from 'bignumber.js';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ERRORS, validateAccount, validatePositiveNumber } from './validation';
import * as abis from '../../contracts';
import AccountSelector from '../../Elements/elementAccountSelector';
import DragoApi from '../../DragoApi/src'
import ElementDialogAddressTitle from '../../Elements/elementDialogAddressTitle'
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementFundActionAuthorization from '../../Elements/elementActionAuthorization'
import IdentityIcon from '../../IdentityIcon';
import utils from '../../utils/utils.js'

import styles from './elementVaultActionSetFees.module.css';

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits

const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ElementVaultActionSetFees extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    accounts: PropTypes.array.isRequired,
    vaultDetails: PropTypes.object.isRequired,
    openActionForm: PropTypes.func.isRequired,
    snackBar: PropTypes.func
  }

  state = {
    account: {},
    openAuth: false,
    accountError: ERRORS.invalidAccount,
    amountError: null,
    price: this.props.vaultDetails.price,
    feesError: ERRORS.invalidPrices,
    sending: false,
    complete: false,
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }

  componentDidMount () {
    const { api } = this.context
    console.log(api)
  }

  render () {
    
    const { complete, openAuth, authMsg, authAccount } = this.state;
    const {vaultDetails} = this.props

    if (complete) {
      return null;
    }

    const titleStyle = {
      padding: 0,
      lineHeight: '20px',
      fontSize: 16
    }

    if (openAuth) {
      return (
        <div>
          <ElementFundActionAuthorization
            vaultDetails={vaultDetails}
            authMsg={authMsg}
            account={authAccount}
            onClose={this.onClose}
          />
        </div>
      )
    }

    return (
      <div key='setPriceDialoDiv'>
      <Dialog key='setPriceDialog'
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal 
        open={true}
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
      </div>
    );
  }

  renderHeader = () => {
    const { vaultDetails } = this.props
    return (
      <div key='dialogHeader'>
          <ElementDialogHeadTitle primaryText='Set Fees' />
          <ElementDialogAddressTitle tokenDetails={vaultDetails} />
      </div>
    )
  }

  

  onClose =(event) =>{
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event,'setFees')
  }

  renderActions = () => {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton key='dialogButton1'
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { accountError, amountError, sending } = this.state;
    const hasError = !!( amountError || accountError );

    return ([
      <FlatButton
        key='dialogButton1'
        label='Cancel'
        name='setPrice'
        primary
        onTouchTap={ this.onClose} />,
      <FlatButton
        key='dialogButton2'
        label='Save'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields = () => {
    const { vaultDetails } = this.props
    const { price, sellPrice } = this.state
    const amountLabel = 'Please enter a value';
    const buyText = {
      color: Colors.green300,
    }

    const sellText = {
      color: Colors.red300,
    }

    const priceBox = {
      padding: 0,
      textAlign: 'center',
      fontSize: 25,
    }

    const priceBoxHeader = {
      buy: {
        backgroundColor: Colors.green300
      },
      sell: {
        backgroundColor: Colors.red300
      }
    }

    const priceBoxHeaderTitleStyle = {
      padding: 0,
      textAlign: 'center',
      fontSize: 25,
      fontWeight: 600,
    }

    
    return (
      <div key='inputFields'>
        <Row>
          <Col xs={12}>
          <p>Fees are expressed in basis points and must be equal or higher than 0.01%.</p>
          <p>Fractions of basis points are not allowed.</p>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
          <AccountSelector
          key='accountSelector'
          accounts={this.props.accounts}
          account={this.state.account}
          errorText={this.state.accountError}
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={this.onChangeAddress} />
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Paper zDepth={1}>
              <Row>
                <Col xs={4}>
                  <AppBar
                    title="FEES"
                    showMenuIconButton={false}
                    style={priceBoxHeader.buy}
                    titleStyle={priceBoxHeaderTitleStyle}
                  />
                  <div className={styles.currentPriceText}>
                    {(isNaN(this.state.price) || this.state.price == '') ? '-' : this.state.price} %
                  </div>
                </Col>
                <Col xs={8}>
                  <TextField
                    key='setFundPriceField'
                    autoComplete='off'
                    floatingLabelFixed
                    floatingLabelText='The fee for this Vault'
                    fullWidth
                    hintText={amountLabel}
                    errorText={this.state.amountError}
                    name='setVaultPriceField'
                    id='setVaultPriceField'
                    value={this.state.price}
                    onChange={this.onChangeAmount} />
                </Col>
              </Row>
            </Paper>
            {/* <Paper zDepth={1}>
              <Row>

                <Col xs={4}>
                  <AppBar
                    title="SELL"
                    showMenuIconButton={false}
                    style={priceBoxHeader.sell}
                    titleStyle={priceBoxHeaderTitleStyle}
                  />
                  <div className={styles.currentPriceText}>
                    {this.state.sellPrice} ETH
                  </div>

                </Col>
                <Col xs={8}>
                  <TextField
                    key='setFundSellPriceField'
                    autoComplete='off'
                    floatingLabelFixed
                    floatingLabelText='The SELL price for this Drago'
                    fullWidth
                    hintText={amountLabel}
                    errorText={this.state.amountErrorSell}
                    name='setFundSellPriceField'
                    id='setFundSellPriceField'
                    value={this.state.sellPrice}
                    onChange={this.onChangeSellPrice} />
                </Col>

              </Row>
            </Paper> */}
          </Col>
        </Row>
      </div>
    );
  }

  onChangeAddress = (account) => {
    const { api } = this.context;
    this.setState({
      account,
      accountError: validateAccount(account, api)
    });
  }

  onChangeAmount = (event, fee) => {
    if (fee == '') {
      this.setState({
        price: '',
        amountErrorSell: ERRORS.invalidAmount
      });
      return
    }
    if (fee == 0) {
      this.setState({
        price: fee,
      });
      return
    }
    this.setState({
      price: fee,
      amountError: validatePositiveNumber(fee)
    }, this.validateMimimumFee);
  }

  validateMimimumFee = () => {
    const { price } = this.state
    let bn = null;

    try {
      bn = new BigNumber(price);
    } catch (e) {
      this.setState({
        amountError: ERRORS.invalidAmount
      });
      return
    }
    if (bn.decimalPlaces() > 2) {
      this.setState({
        amountError: ERRORS.invalidAmountFractionBasisPoint
      });
      return
    }
    if (!bn.gte(0.01)) {
      this.setState({
        amountError: ERRORS.invalidAmountFeeTooLow
      });
    }
  }

  // validateTotal = () => {
  //   const { account, accountError, price, amountError } = this.state;

  //   if (accountError || amountError) {
  //     return;
  //   }

  //   if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
  //     this.setState({
  //       amountError: ERRORS.invalidTotal
  //     });
  //   }
  // }

  onSend = () => {
    const { api } = this.context;
    const { vaultDetails } = this.props
    const price = this.state.price
    // const { instance } = this.context;
    const options = {
      from: this.state.account.address
    };
    var dragoApi = null;
    var provider = this.state.account.source === 'MetaMask' ? window.web3 : api
    this.setState({
      sending: true
    });
    
    // price must be in basis points. Mimimum fee = 0.01%, equal to price = 1
    dragoApi = new DragoApi(provider)
    dragoApi.contract.vault.init(vaultDetails.address)
    dragoApi.contract.vault.setTransactionFee(this.state.account.address, price)
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
    this.setState({
      openAuth: true,
      authMsg: "Fees set to " + price + " %",
      authAccount: {...this.state.account}
    })
    // this.onClose()
    // this.props.snackBar('Instruction awaiting for authorization')
  }
}