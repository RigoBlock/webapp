import  * as Colors from 'material-ui/styles/colors';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import Add from 'material-ui/svg-icons/content/add';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import TextField from 'material-ui/TextField';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { ERRORS, validateAccount, validatePositiveNumber, validateNewName, validateNewSymbol } from './validation';
import { formatCoins, formatEth, formatHash, toHex } from '../../format';
import * as abis from '../../contracts';
import AccountSelector from '../../Elements/elementAccountSelector'
import IdentityIcon from '../../IdentityIcon'
import utils, {dragoApi} from '../../utils/utils'
import DragoApi from '../../DragoApi/src'
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementFundActionAuthorization from '../../Elements/elementActionAuthorization'


import styles from './elementFundCreateAction.module.css';

const customContentStyle = {
  minHeight: '500px',
};

export default class ElementFundCreateAction extends React.Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
    addTransactionToQueue: PropTypes.func
  };

  static propTypes = {
    // dragoDetails: PropTypes.object.isRequired, 
    accounts: PropTypes.array.isRequired
  };
  
  state = {
    open: false,
    account: {},
    accountError: ERRORS.invalidAccount,
    amountError: ERRORS.invalidAmount,
    dragoName: '',
    dragoNameError: ERRORS.invalidName,
    dragoSymbol: '',
    dragoSymbolError: ERRORS.invalidSymbol,
    canSubmit: false,
    sending: false,
    complete: false,
    dragoDetails: ''
  }


  handleOpen = () => {
    console.log('open')
    this.setState({
      open: true,
      openAuth: false,
      authMsg: '',
      account: {},
      accountError: ERRORS.invalidAccount,
      dragoName: '',
      dragoNameError: ERRORS.invalidName,
      dragoSymbol: '',
      dragoSymbolError: ERRORS.invalidSymbol,
      canSubmit: false,
      sending: false,
      complete: false,
    });
  }

  handleClose = () => {
    this.setState({
      open: false,
      openAuth: false,
      authMsg: '',
      account: {},
      accountError: ERRORS.invalidAccount,
      dragoName: '',
      dragoNameError: ERRORS.invalidName,
      dragoSymbol: '',
      dragoSymbolError: ERRORS.invalidSymbol,
      canSubmit: false,
      sending: false,
      complete: false,
    });
  }

  handleSubmit = () => {
    this.setState(
      { openAuth: true }
    );
  }

  onChangeAddress = (account) => {
    const { api } = this.context;
      this.setState({
        account,
        accountError: validateAccount(account,api)
      });
    }

    onChangeName = (event, dragoName) => {
      this.setState({
        dragoName : dragoName.toLowerCase(),
        dragoNameError: validateNewName(dragoName)
      });
    }
  
    onChangeSymbol = (event, dragoSymbol) => {
      this.setState({
        dragoSymbol: dragoSymbol.toUpperCase(),
        dragoSymbolError: validateNewSymbol(dragoSymbol)
      });
    }

    onSend = () => {
      const { api } = this.context
      const dragoName = this.state.dragoName.toString();
      const dragoSymbol = this.state.dragoSymbol.toString();
      const dragoDetails = {
        name: dragoName,
        symbol: dragoSymbol
      }
      const values = [dragoName, dragoSymbol, this.state.account.address]
      var provider = this.state.account.source === 'MetaMask' ? window.web3 : api
      var dragoApi, provider = null;
      // Initializing transaction variables
      const authMsg = 'You deployed the fund ' + dragoSymbol + ' | ' + dragoName 
      const transactionId = api.util.sha3(new Date() + dragoSymbol)
      var transactionDetails = {
        status: this.state.account.source === 'MetaMask' ? 'pending' : 'authorization',
        hash: '',
        parityId: null,
        timestamp: new Date(),
        account: this.state.account,
        error: false,
        action: 'DragoCreated',
        symbol: dragoSymbol,
        amount: ''
      }

      // Setting variables depending on account source
      var provider = this.state.account.source === 'MetaMask' ? window.web3 : api
      this.context.addTransactionToQueue(transactionId, transactionDetails)
      const {account} = this.state


      this.setState({
        sending: true
      })
      dragoApi = new DragoApi(provider)
      dragoApi.contract.dragofactory.init()
      .then(()=>{
        dragoApi.contract.dragofactory.createDrago(dragoName, dragoSymbol, this.state.account.address)
        .then ((receipt) =>{
          console.log(receipt)
          // this.props.snackBar('Deploy awaiting for authorization')
          if (account.source === 'MetaMask') {
            transactionDetails.status = 'executed'
            transactionDetails.receipt = receipt
            transactionDetails.hash = receipt.transactionHash
            transactionDetails.timestamp = new Date ()
            this.context.addTransactionToQueue(transactionId, transactionDetails)
          } else {
            transactionDetails.parityId = receipt
            this.context.addTransactionToQueue(transactionId, transactionDetails)
          }
          this.setState({
            sending: false,
            complete: true
          });
        })
        .catch((error) => {
          console.log(error)
          this.props.snackBar('Your wallet returned an error.')
          transactionDetails.status = 'error'
          transactionDetails.error = error
          this.context.addTransactionToQueue(transactionId, transactionDetails)
          this.setState({
            sending: false
          })
        })
      })
      // .then ((receipt) =>{
      //   console.log(receipt)
      //   // this.props.snackBar('Deploy awaiting for authorization')
      //   if (this.state.account.source === 'MetaMask') {
      //     transactionDetails.status = 'executed'
      //     transactionDetails.receipt = receipt
      //     transactionDetails.hash = receipt.transactionHash
      //     transactionDetails.timestamp = new Date ()
      //     this.context.addTransactionToQueue(transactionId, transactionDetails)
      //   } else {
      //     transactionDetails.parityId = receipt
      //     this.context.addTransactionToQueue(transactionId, transactionDetails)
      //   }
      //   this.setState({
      //     sending: false,
      //     complete: true
      //   });
      // })
      // .catch((error) => {
      //   console.log(error)
      //   this.props.snackBar('Your wallet returned an error.')
      //   transactionDetails.status = 'error'
      //   transactionDetails.error = error
      //   this.context.addTransactionToQueue(transactionId, transactionDetails)
      //   this.setState({
      //     sending: false
      //   })
      // })
      this.setState({
        authMsg: authMsg,
        authAccount: { ...this.state.account },
        sending: false,
        dragoDetails: dragoDetails
        // complete: true,
      }, this.handleSubmit)
    }

    renderHeader = () => {
      const { dragoDetails } = this.props
      return (
        <div>
            <ElementDialogHeadTitle primaryText='Deploy new Drago' />
        </div>
  
      )
    }

    renderActions () {
      const { complete } = this.state;
  
      if (complete) {
        return (
          <FlatButton
            label='Done'
            primary
            onTouchTap={ this.handleClose } />
        );
      }
  
      const { accountError, dragoNameError, dragoSymbolError, sending } = this.state;
      const hasError = !!( accountError || dragoNameError || dragoSymbolError);
  
      return ([
        <FlatButton
          label='Cancel'
          primary
          onTouchTap={ this.handleClose } />,
        <FlatButton
          label='Deploy'
          primary
          disabled={ hasError || sending }
          onTouchTap={ this.onSend } />
      ]);
    }

    render() {
      const { accounts  } = this.props
      const { accountError, amountError, sending, openAuth, authMsg, authAccount, dragoDetails } = this.state;
      const hasError = !!(this.state.accountError || this.state.amountError );
      const labelStyle = {
        color: '#FFFFFF',
        fontWeight: 700
      }
      const titleStyle = {
        padding: 0,
        lineHeight: '20px',
        fontSize: 16
      }
      const nameLabel = 'The name of your brand new drago';
      const symbolLabel = 'The symbol of your brand new drago';

      if (openAuth) {
        return (
          <div>
          <FlatButton label="Deploy" primary={true} onClick={this.handleOpen} 
            labelStyle={labelStyle}
            backgroundColor={Colors.blue500}
            hoverColor={Colors.blue300}
            />
            <ElementFundActionAuthorization
              dragoDetails={dragoDetails}
              authMsg={authMsg}
              account={authAccount}
            />
          </div>
        )
      }

      return (
        <div>
          <FlatButton label="Deploy" primary={true} onClick={this.handleOpen} 
            labelStyle={labelStyle}
            backgroundColor={Colors.blue500}
            hoverColor={Colors.blue300}
            />
            <Dialog
              title={this.renderHeader()}
              actions={ this.renderActions() }
              modal={false}
              open={this.state.open}
              titleStyle={titleStyle}
              contentStyle={customContentStyle}
              onRequestClose={this.handleClose}
            >
            <Row>
              <Col xs={12}>
                <AccountSelector
                accounts={ this.props.accounts }
                account={ this.state.account }
                errorText={ this.state.accountError }
                floatingLabelText='From account'
                hintText='The account the transaction will be made from'
                onSelect={ this.onChangeAddress } />
              </Col>
            </Row>
            <Row>
                <Col xs={12}>
                <TextField
                  autoComplete='off'
                  floatingLabelFixed
                  floatingLabelText={ nameLabel }
                  fullWidth
                  hintText='Drago name'
                  name='name'
                  id='name'
                  errorText={ this.state.dragoNameError }
                  value={ this.state.dragoName } 
                  onChange={ this.onChangeName } />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                <TextField
                  autoComplete='off'
                  floatingLabelFixed
                  floatingLabelText={ symbolLabel }
                  fullWidth
                  hintText='Drago symbol (3 letters)'
                  errorText={ this.state.dragoSymbolError }
                  name='symbol'
                  id='symbol'
                  value={ this.state.dragoSymbol }
                  onChange={ this.onChangeSymbol } />
                </Col>
            </Row>
          </Dialog>
        </div>
      );
    }
}