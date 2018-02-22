// Copyright 2016-2017 Rigo Investment Sarl.

import IdentityIcon from '../../IdentityIcon';
import styles from './accountItem.module.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AccountItem extends Component {
  static propTypes = {
    account: PropTypes.object,
    gabBalance: PropTypes.bool
  };

  render () {
    const { account, gabBalance } = this.props;

    let balance;
    let token;

    if (gabBalance) {
      if (account.gabBalance) {
        balance = account.gabBalance;
        token = 'GAB';
      }
    } else {
      if (account.ethBalance) {
        balance = account.ethBalance;
        token = 'ETH';
      }
    }

    return (
      <div className={ styles.account }>
        <div className={ styles.image }>
          <IdentityIcon address={ account.address } />
        </div>
        <div className={ styles.details }>
          <div className={ styles.name }>
            { account.name || account.address }
          </div>
          <div className={ styles.balance }>
            { balance }<small> { token }</small>
          </div>
        </div>
      </div>
    );
  }
}
