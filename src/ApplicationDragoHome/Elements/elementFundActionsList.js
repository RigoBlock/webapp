// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import Subheader from 'material-ui/Subheader'
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';

import IdentityIcon from '../../IdentityIcon';

// import styles from './elementAccountItem.module.css';

import PropTypes from 'prop-types';
import ElementFundActionDeposit from '../Elements/elementFundActionDeposit'
import ElementFundActionWithdraw from '../Elements/elementFundActionWithdraw'
import ElementFundActionPlaceOrder from '../Elements/elementFundActionPlaceOrder'
import ElementFundActionCancelOrder from '../Elements/elementFundActionCancelOrder'
import ElementFundActionFinalizeOrder from '../Elements/elementFundActionFinalizeOrder'
import ElementFundActionSetPrice from '../Elements/elementFundActionSetPrice'

export default class ElementFundActionsList extends Component {
  static propTypes = {
    accounts: PropTypes.array.isRequired,
    dragoDetails: PropTypes.object.isRequired,
    snasnackBar: PropTypes.func
  };

  state = {
    openMenuActions: false,
    showActionMenuItem:{
      deposit: false,
      withdraw: false,
      placeOrder: false,
      cancelOrder: false,
      finalizeOrder: false,
      setPrice: false,
    }
  }

  handleOpenMenuActions = (event) => {
    this.setState({
      openMenuActions: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      openMenuActions: !this.state.openMenuActions,
    });
  };

  openActionForm = (event, value) => {
    this.setState({
      openMenuActions: false,
    });
    console.log(value)
    switch (value) {
      case 'deposit':
        this.setState({
          showActionMenuItem: {
            deposit: !this.state.showActionMenuItem.deposit
          }
        })
        break;
      case 'withdraw':
        this.setState({
          showActionMenuItem: {
            withdraw: !this.state.showActionMenuItem.withdraw
          }
        })
        break;
      case 'placeOrder':
        this.setState({
          showActionMenuItem: {
            placeOrder: !this.state.showActionMenuItem.placeOrder
          }
        })
        break;
      case 'cancelOrder':
        this.setState({
          showActionMenuItem: {
            cancelOrder: !this.state.showActionMenuItem.cancelOrder
          }
        })
        break;
      case 'finalizeOrder':
        this.setState({
          showActionMenuItem: {
            finalizeOrder: !this.state.showActionMenuItem.finalizeOrder
          }
        })
        break;
        case 'setPrice':
        this.setState({
          showActionMenuItem: {
            setPrice: !this.state.showActionMenuItem.setPrice
          }
        })
        break;
      default:
        return null
    }
    return null
  }

  render () {
    const { dragoDetails } = this.props
    // Selectiong only the account which is the owner of the Drago
    console.log(dragoDetails.addresssOwner)
    const accounts = this.props.accounts.filter((account) =>{
      return account.address == dragoDetails.addresssOwner
    })
    console.log(accounts)
    return (
      <div>
        <RaisedButton
          onClick={this.handleOpenMenuActions}
          label="Actions"
          primary={true}
          labelStyle={{fontWeight: 700}}
        />
        <Popover
          open={this.state.openMenuActions}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
          <Menu 
          desktop={true}
          onChange={this.openActionForm}>
            <Subheader inset={false}>Drago</Subheader>
            <MenuItem value="setPrice" primaryText="Set Prices"/>
            <MenuItem value="1" primaryText="Set Fee" disabled={true}/>
            <MenuItem value="2" primaryText="Fee Account" disabled={true}/>
            <MenuItem value="3" primaryText="Estimante NAV" disabled={true}/>
            <Subheader inset={false}>Exchange</Subheader>
            <MenuItem value="deposit" primaryText="Deposit"/>
            <MenuItem value="withdraw" primaryText="Withdraw"/>
            <MenuItem value="placeOrder" primaryText="Place Order"/>
            <MenuItem value="cancelOrder" primaryText="Cancel Order"/>
            <MenuItem value="finalizeOrder" primaryText="Finalize"/>
          </Menu>
        </Popover>
        {this.state.showActionMenuItem.deposit ?
              <ElementFundActionDeposit accounts={accounts} 
                dragoDetails={dragoDetails} 
                openActionForm={this.openActionForm}
                snackBar={this.props.snackBar}/> :
              null
            }
        {this.state.showActionMenuItem.withdraw ?
              <ElementFundActionWithdraw accounts={accounts} 
                dragoDetails={dragoDetails} 
                openActionForm={this.openActionForm}
                snackBar={this.props.snackBar}/> :
              null
            }
        {this.state.showActionMenuItem.placeOrder ?
              <ElementFundActionPlaceOrder accounts={accounts} 
                dragoDetails={dragoDetails} 
                openActionForm={this.openActionForm}
                snackBar={this.props.snackBar}/> :
              null
            }
        {this.state.showActionMenuItem.cancelOrder ?
              <ElementFundActionCancelOrder accounts={accounts} 
                dragoDetails={dragoDetails} 
                openActionForm={this.openActionForm}
                snackBar={this.props.snackBar}/> :
              null
            }
        {this.state.showActionMenuItem.finalizeOrder ?
              <ElementFundActionFinalizeOrder accounts={accounts} 
                dragoDetails={dragoDetails} 
                openActionForm={this.openActionForm}
                snackBar={this.props.snackBar}/> :
              null
            }
        {this.state.showActionMenuItem.setPrice ?
          <ElementFundActionSetPrice accounts={accounts}
            dragoDetails={dragoDetails}
            openActionForm={this.openActionForm}
            snackBar={this.props.snackBar} /> :
          null
        }
      </div>
    );
  }
}