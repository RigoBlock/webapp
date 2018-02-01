// Copyright 2016-2017 Rigo Investment Sarl.

import IdentityIcon from '../../IdentityIcon';

import styles from './exchangeItem.module.css';

import React, { Component, PropTypes } from 'react';

export default class ExchangeItem extends Component {
  static propTypes = {
    exchange: PropTypes.object,
    gabBalance: PropTypes.bool
  };

  render () {
    const { exchange, gabBalance } = this.props;

    let balance;
    let token;

    if (gabBalance) {
      if (exchange.gabBalance) {
        balance = exchange.gabBalance;
        token = 'GAB';
      }
    } else {
      if (exchange.ethBalance) {
        balance = exchange.ethBalance;
        token = 'ETH';
      }
    }

    return (
      <div className={ styles.account }>
        <div className={ styles.image }>
          <IdentityIcon address={ exchange.address } />
        </div>
        <div className={ styles.details }>
          <div className={ styles.name }>
            { exchange.name || exchange.address }
          </div>
          <div className={ styles.balance }>
            { balance }<small> { token }</small>
          </div>
        </div>
      </div>
    );
  }
}
