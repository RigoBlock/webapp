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

import styles from './elementFundActionSetPrice.module.css';

const NAME_ID = ' ';
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'; //ADDRESS_0 is for ETH deposits

const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ElementFundActionSetPrice extends Component {

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
    openAuth: false,
    accountError: ERRORS.invalidAccount,
    // amountErrorBuy: ERRORS.invalidAmount,
    // amountErrorSell: ERRORS.invalidAmount,
    amountErrorBuy: null,
    amountErrorSell: null,
    buyPrice: this.props.dragoDetails.buyPrice,
    sellPrice: this.props.dragoDetails.sellPrice,
    pricesError: ERRORS.invalidPrices,
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
    const {dragoDetails} = this.props

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
            dragoDetails={dragoDetails}
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
    const { dragoDetails } = this.props
    return (
      <div key='dialogHeader'>
          <ElementDialogHeadTitle primaryText='Set Price' />
          <ElementDialogAddressTitle tokenDetails={dragoDetails} />
      </div>
    )
  }

  

  onClose =(event) =>{
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event,'setPrice')
  }

  renderActions = () => {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton key='dialoButton1'
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { accountError, amountErrorBuy, amountErrorSell, sending } = this.state;
    const hasError = !!(amountErrorBuy || amountErrorSell || accountError );

    return ([
      <FlatButton
        key='dialoButton1'
        label='Cancel'
        name='setPrice'
        primary
        onTouchTap={ this.onClose} />,
      <FlatButton
        key='dialoButton2'
        label='Save'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields = () => {
    const { dragoDetails } = this.props
    const { buyPrice, sellPrice } = this.state
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
        <AccountSelector
          key='accountSelector'
          accounts={this.props.accounts}
          account={this.state.account}
          errorText={this.state.accountError}
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={this.onChangeAddress} />
        <Row>
          <Col xs={12}>
            <Paper zDepth={1}>
              <Row>
                <Col xs={4}>
                  <AppBar
                    title="BUY"
                    showMenuIconButton={false}
                    style={priceBoxHeader.buy}
                    titleStyle={priceBoxHeaderTitleStyle}
                  />
                  <div className={styles.currentPriceText}>
                    {isNaN(this.state.buyPrice) ? '-' : this.state.buyPrice} ETH
                  </div>
                </Col>
                <Col xs={8}>
                  <TextField
                    key='setFundBuyPriceField'
                    autoComplete='off'
                    floatingLabelFixed
                    floatingLabelText='The BUY price for this Drago'
                    fullWidth
                    hintText={amountLabel}
                    errorText={this.state.amountErrorBuy}
                    name='setFundBuyPriceField'
                    id='setFundBuyPriceField'
                    value={this.state.buyPrice}
                    onChange={this.onChangeBuyPrice} />
                </Col>
              </Row>
            </Paper>
            <Paper zDepth={1}>
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
            </Paper>
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

  onChangeBuyPrice = (event, buyPrice) => {
    const { account, accountError, amountErrorBuy, sellPrice } = this.state;
    const error = validatePositiveNumber(buyPrice)
    console.log(buyPrice)
    if (buyPrice == '') {
      this.setState({
        buyPrice: '',
        amountErrorBuy: error
      });
      return
    }
    // Checking if a valid positive number
    if (error) {
      this.setState({
        buyPrice: buyPrice,
        amountErrorBuy: error
      });
    } else {
      if (validatePositiveNumber(sellPrice)) {
        this.setState({
          buyPrice: buyPrice,
          amountErrorBuy: error
        })
        return
      }
      // Checking if buyPrice >= sellPrice
      if(new BigNumber(buyPrice).gte(sellPrice)) {
        this.setState({
          buyPrice: buyPrice,
          amountErrorBuy: error
        })
      } else {
        this.setState({
          buyPrice: buyPrice,
          amountErrorBuy: ERRORS.invalidPrices
        })
      }
    }
  }

  onChangeSellPrice = (event, sellPrice) => {
    const { account, accountError, amountErrorSell, buyPrice } = this.state;
    const error = validatePositiveNumber(sellPrice)
    console.log(sellPrice)
    if (sellPrice == '') {
      this.setState({
        sellPrice: '',
        amountErrorSell: error
      });
      return
    }
    // Checking if a valid positive number
    if (error) {
      this.setState({
        sellPrice: sellPrice,
        amountErrorSell: error
      });
    } else {
      if (validatePositiveNumber(buyPrice)) {
        this.setState({
          sellPrice: sellPrice,
          amountErrorSell: error
        })
        return
      }
      // Checking if buyPrice >= sellPrice
      if(new BigNumber(buyPrice).gte(sellPrice)) {
        this.setState({
          sellPrice: sellPrice,
          amountErrorSell: error
        })
      } else {
        this.setState({
          sellPrice: sellPrice,
          amountErrorSell: ERRORS.invalidPrices
        })
      }
    }
  }

  onSend = () => {
    const { api } = this.context;
    const { dragoDetails } = this.props
    const { buyPrice, sellPrice } = this.state
    // const { instance } = this.context;
    const options = {
      from: this.state.account.address
    };
    var dragoApi = null;
    var provider = this.state.account.source === 'MetaMask' ? window.web3 : api
    this.setState({
      sending: true
    });
    
    dragoApi = new DragoApi(provider)
    dragoApi.contract.drago.init(dragoDetails.address)
    dragoApi.contract.drago.setPrices(this.state.account.address, buyPrice, sellPrice)
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
      authMsg: "BUY price set to " + buyPrice + " ETH. SELL price set to " + sellPrice + " ETH",
      authAccount: {...this.state.account}
    })
    // this.onClose()
    // this.props.snackBar('Instruction awaiting for authorization')
  }
}