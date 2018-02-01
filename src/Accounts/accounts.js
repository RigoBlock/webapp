// Copyright 2016-2017 Rigo Investment Sarl.

import IdentityIcon from '../IdentityIcon';
import styles from './accounts.module.css';

import React, { Component} from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Chip } from 'material-ui';

export default class Accounts extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array
  }

  render () {
    const has = this._hasAccounts();

    return (
      <div className={ styles.accounts }>
        { has ? this.renderAccounts() : this.renderEmpty() }
      </div>
    );
  }

  renderEmpty () {
    return (
      <div className={ styles.none }>
        You currently do not have any GABcoin in any of your addresses, create some
      </div>
    );
  }

  renderAccounts () {
    const { accounts } = this.props;

    return accounts
      .filter((account) => account.hasGab)
      .map((account) => {
        return (
          <Chip
            className={ styles.account }
            key={ account.address }>
            <IdentityIcon address={ account.address } />
            <span className={ styles.name }>
              { account.name }
            </span>
            <span className={ styles.balance }>
              { account.gabBalance }
            </span>
          </Chip>
        );
      });
  }

  _hasAccounts () {
    const { accounts } = this.props;

    if (!accounts || !accounts.length) {
      return false;
    }

    return accounts.filter((account) => account.hasGab).length !== 0;
  }
}
