// Copyright 2016-2017 Gabriele Rigo

import styles from './actions.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { RaisedButton } from 'material-ui';
import { Dialog, FlatButton, TextField } from 'material-ui';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';

import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';
//import ActionAndroid from 'material-ui/svg-icons/action/android';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';
import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationDragoAdmin from '../ApplicationDragoAdmin';

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// const muiTheme = getMuiTheme(lightBaseTheme);

export default class ActionsDrago extends Component {

  state = {
        open: false,
  }

  static childContextTypes = {
    muiTheme: PropTypes.object
  };

  static propTypes = {
    onChangeDragoName: PropTypes.func, //onChangeDragoName: PropTypes.func.isRequired,
    onChangeDragoSymbol: PropTypes.func, //onChangeDragoSymbol: PropTypes.func.isRequired,
    onAction: PropTypes.func.isRequired,
    gabBalance: PropTypes.object.isRequired
  }

  render () {
    const { gabBalance } = this.props;

    return (
      <div className={ styles.actions }>
        <div className={ styles.vault }>
          <ApplicationDragoFactory />
        </div>
        <RaisedButton
          className={ styles.button }
          icon={ <ContentSend /> }
          label='buy drago'
          primary
          onTouchTap={ this.onBuyDrago } />
        <RaisedButton
          className={ styles.button }
          icon= { <ContentSend /> }
          label='sell drago'
          primary
          onTouchTap={ this.onSellDrago } />
        <RaisedButton
          className={ styles.button }
          //icon={ <AvReplay /> }
          //icon= { <ActionAddShoppingCart /> }
          icon= { <AccountBalance /> }
          label='manage dragos'
          primary
          onTouchTap={ this.handleToggle } />
        <Drawer
          width={200}
          openSecondary={true}
          open={this.state.open} >
          <AppBar title="Dragos"
            onTouchTap={ this.handleToggle } />
          <ApplicationDragoAdmin />
        </Drawer>
      </div>
    );
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  getChildContext () {
    return {
      // muiTheme
    };
  }

/*
<RaisedButton
  disabled={ !gabBalance || gabBalance.eq(0) }
  className={ styles.button }
  icon={ <ContentSend /> }
  label='send drago'
  primary
  onTouchTap={ this.onTransfer } />
  */

/*
<RaisedButton
  className={ styles.button }
  icon={ <AccountBalance /> }
  label='create drago'
  primary
  onTouchTap={ this.onDeploy } />
  */

  onBuyDrago = () => {
    this.props.onAction('BuyDrago');
  }
/*
  onTransfer = () => {
    const { gabBalance } = this.props;

    if (gabBalance && gabBalance.gt(0)) {
      this.props.onAction('Transfer');
    }
  }
*/
  onSellDrago = () => {
    this.props.onAction('SellDrago');
  }
/*
  onDeploy = () => {
    this.props.onAction('Deploy');
  }
*/
}
