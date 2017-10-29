// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import BigNumber from 'bignumber.js';

const DIVISOR = 10 ** 6;
const ZERO = new BigNumber(0);

export function formatBlockNumber (blockNumber) {
  return ZERO.eq(blockNumber || 0)
    ? 'Pending'
    : `#${blockNumber.toFormat()}`;
}

export function formatCoins (amount, decimals = 1) {  //prev. decimals = 6
  const adjusted = amount.div(DIVISOR);

  if (decimals === -1) {
    if (adjusted.gte(10000)) {
      decimals = 0;
    } else if (adjusted.gte(1000)) {
      decimals = 1;
    } else if (adjusted.gte(100)) {
      decimals = 2;
    } else if (adjusted.gte(10)) {
      decimals = 3;
    } else {
      decimals = 4;
    }
  }

  return adjusted.toFormat(decimals);
}

export function formatEth (eth, decimals = 2, api) {
  return api.util.fromWei(eth).toFormat(decimals);
}

export function formatHash (hash) {
  return `${hash.substr(0, 10)}...${hash.substr(-8)}`;
}
