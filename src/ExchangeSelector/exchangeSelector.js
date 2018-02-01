// Copyright 2016-2017 Rigo Investment Sarl.

import ExchangeItem from './ExchangetItem';

import BigNumber from 'bignumber.js';
import React, { Component, PropTypes } from 'react';
import { MenuItem, SelectField } from 'material-ui';

const NAME_ID = ' ';
let lastSelectedAccount = {};

export default class ExchangeSelect extends Component {
  static propTypes = {
    exchanges: PropTypes.array,
    exchange: PropTypes.object,
    anyAccount: PropTypes.bool,
    gabBalance: PropTypes.bool,
    onSelect: PropTypes.func,
    errorText: PropTypes.string,
    floatingLabelText: PropTypes.string,
    hintText: PropTypes.string
  }

  componentDidMount () {
    this.props.onSelect(lastSelectedAccount);
  }

  render () {
    const { exchange, exchanges, anyAccount, errorText, floatingLabelText, gabBalance, hintText } = this.props;

    return (
      <SelectField
        autoComplete='off'
        floatingLabelFixed
        floatingLabelText={ floatingLabelText }
        fullWidth
        hintText={ hintText }
        errorText={ errorText }
        name={ NAME_ID }
        id={ NAME_ID }
        value={ account }
        onChange={ this.onSelect }>
        { renderAccounts(exchanges, { anyExchange, gabBalance }) }
      </SelectField>
    );
  }

  onSelect = (event, idx, exchange) => {
    lastSelectedExchange = exchange || {};
    this.props.onSelect(lastSelectedExchange);
  }
}


function isPositive (numberStr) {
  return new BigNumber(numberStr.replace(/,/g, '')).gt(0);
}

//something not working in the "from account" field of deployDrago, returns blank fields


export function renderAccounts (exchanges, options = {}) {
  return exchanges
    .filter((exchange) => {
      if (options.anyExchange) {
        return true;
      }

      return isPositive(exchange[options.gabBalance ? 'gabBalance' : 'ethBalance']);
    })
    .map((account) => {
      const item = (
        <ExchangeItem
          exchange={ exchange }
          key={ exchange.address }
          gabBalance={ options.gabBalance || false } />
      );

      return (
        <MenuItem
          key={ exchange.address }
          value={ exchange }
          label={ item }>
          { item }
        </MenuItem>
      );
    });
}
