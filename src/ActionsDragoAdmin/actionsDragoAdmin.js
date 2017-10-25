// Copyright 2016-2017 Gabriele Rigo

import styles from './actions.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { RaisedButton } from 'material-ui';
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';
import ActionAndroid from 'material-ui/svg-icons/action/android';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

export default class ActionsDragoAdmin extends Component {
  static contextTypes = {
    instance: PropTypes.object
  }

  static propTypes = {
    onAction: PropTypes.func.isRequired,
    gabBalance: PropTypes.object.isRequired
  }

  render () {
    //const { instance } = this.context;
    // console.log(this.context);
    const { gabBalance } = this.props;

    return (
      <div className={ styles.actions }>
        <RaisedButton
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='deposit'
          primary={true}
          fullWidth={true}
          //disabled={ !instance || instance.eq(0) }
          //primary
          onTouchTap={ this.onDeposit } />
        <RaisedButton
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='withdraw'
          primary
          fullWidth={true}
          onTouchTap={ this.onWithdraw } />
        <RaisedButton
          //className={ styles.button }
          icon= { <ContentSend /> }
          label='placeOrder'
          primary
          fullWidth={true}
          onTouchTap={ this.onPlaceOrder } />
        <RaisedButton
          //disabled={ !gabBalance || gabBalance.eq(0) }
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='cancelOrder'
          primary={true}
          fullWidth={true}
          onTouchTap={ this.onCancelOrder } />
        <RaisedButton
          //className={ styles.button }
          icon={ <ContentSend /> }
          //icon= { <ActionAddShoppingCart /> }
          //icon= { <AccountBalance /> }
          label='finalize'
          primary
          fullWidth={true}
          onTouchTap={ this.onFinalize } />
        <RaisedButton
          //className={ styles.button }
          icon= { <ContentSend /> }
          label='Set Fee'
          disabled={true}
          primary
          fullWidth={true}
          onTouchTap={ this.onSetFee } />
        <RaisedButton
          //disabled={ !gabBalance || gabBalance.eq(0) }
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='Fee Account'
          disabled={true}
          primary={true}
          fullWidth={true}
          onTouchTap={ this.onSetFeeCollector } />
        <RaisedButton
          //disabled={ !gabBalance || gabBalance.eq(0) }
          //className={ styles.button }
            icon={ <ContentSend /> }
          label='Estimate NAV'
          disabled={true}
          primary={true}
          fullWidth={true}
          onTouchTap={ this.onEstimateNav } />
        <RaisedButton
          //disabled={ !gabBalance || gabBalance.eq(0) }
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='Set Prices'
          disabled={true}
          primary={true}
          fullWidth={true}
          onTouchTap={ this.onSetPrices } />
      </div>
    );
  }

  onWithdraw = () => {
    this.props.onAction('DragoWithdraw');
  }

  onCancelOrder = () => {
    this.props.onAction('DragoCancelOrder');
  }
/*
  onCancelOrder = () => {
    const { gabBalance } = this.props;

    if (gabBalance && gabBalance.gt(0)) {
      this.props.onAction('CancelOrder');
    }
  }
*/

  onPlaceOrder = () => {
    this.props.onAction('DragoPlaceOrder');
  }

  onFinalize = () => {
    this.props.onAction('DragoFinalize');
  }

  onDeposit = () => {
    this.props.onAction('DragoDeposit');
  }

  onEstimateNav = () => {
    this.props.onAction('EstimateNav');
  }

  onSetPrices = () => {
    this.props.onAction('SetPrices');
  }
}
