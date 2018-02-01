// Copyright 2016-2017 Rigo Investment Sarl.

import IdentityIcon from '../IdentityIcon';
import AccountSelector from '../AccountSelector';

import styles from './accountSelectorText.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { TextField } from 'material-ui';

const NAME_ID = ' ';

export default class AccountSelectorText extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    account: PropTypes.object,
    errorText: PropTypes.string,
    gabBalance: PropTypes.bool,
    anyAccount: PropTypes.bool,
    floatingLabelText: PropTypes.string,
    hintText: PropTypes.string,
    selector: PropTypes.bool,
    onChange: PropTypes.func
  }

  render () {
    const { selector } = this.props;

    return selector
      ? this.renderDropDown()
      : this.renderTextField();
  }

  renderDropDown () {
    const { account, accounts, anyAccount, errorText, gabBalance, hintText, floatingLabelText, onChange } = this.props;

    return (
      <AccountSelector
        anyAccount={ anyAccount }
        gabBalance={ gabBalance }
        accounts={ accounts }
        account={ account }
        errorText={ errorText }
        floatingLabelText={ floatingLabelText }
        hintText={ hintText }
        onSelect={ onChange } />
    );
  }

  renderTextField () {
    const { account, errorText, hintText, floatingLabelText } = this.props;

    return (
      <div className={ styles.addrtext }>
        <TextField
          className={ styles.input }
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ floatingLabelText }
          fullWidth
          hintText={ hintText }
          errorText={ errorText }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ account.address || '' }
          onChange={ this.onChangeAddress } />
        { this.renderAddressIcon() }
      </div>
    );
  }

  renderAddressIcon () {
    const { account } = this.props;

    if (!account.address) {
      return null;
    }

    return (
      <div className={ styles.addricon }>
        <IdentityIcon address={ account.address } />
      </div>
    );
  }

  onChangeAddress = (event, address) => {
    const lower = address.toLowerCase();
    const account = this.props.accounts.find((_account) => _account.address.toLowerCase() === lower);

    this.props.onChange(account || { address });
  }
}
