// Copyright 2016-2017 Rigo Investment Sarl.

import { formatBlockNumber, formatCoins, formatEth } from '../format';

import styles from './status.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class Status extends Component {
  static propTypes = {
    address: PropTypes.string,
    gabBalance: PropTypes.object,
    blockNumber: PropTypes.object,
    totalSupply: PropTypes.object,
    remaining: PropTypes.object,
    price: PropTypes.object,
    children: PropTypes.node
  }

  render () {
    const { blockNumber, gabBalance, totalSupply, remaining, price } = this.props;

    if (!totalSupply) {
      return null;
    }

    return (
      <div className={ styles.status }>
        <div className={ styles.item }>
          <div className={ styles.heading }>&nbsp;</div>
          <div className={ styles.hero }>
            { formatCoins(remaining, -1) }
          </div>
          <div className={ styles.byline }>
            available for { formatEth(price) }ETH
          </div>
        </div>
        <div className={ styles.item }>
          <div className={ styles.heading }>GABcoin</div>
          <div className={ styles.hero }>
            { formatCoins(totalSupply, -1) }
          </div>
          <div className={ styles.byline }>
            total at { formatBlockNumber(blockNumber) }
          </div>
        </div>
        <div className={ styles.item }>
          <div className={ styles.heading }>&nbsp;</div>
          <div className={ styles.hero }>
            { formatCoins(gabBalance, -1) }
          </div>
          <div className={ styles.byline }>
            coin balance
          </div>
        </div>
        { this.props.children }
      </div>
    );
  }
}
