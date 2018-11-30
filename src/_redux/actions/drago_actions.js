// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from './const'

const drago = {
  getTokenBalancesDrago: (dragoDetails, relay) => {
    return {
      type: TYPE_.GET_TOKEN_BALANCES_DRAGO,
      payload: {
        dragoDetails,
        relay
      }
    }
  },
  getPoolDetails: (dragoId, options = { poolType: 'drago', wallet: '' }) => {
    return {
      type: TYPE_.GET_POOL_DETAILS,
      payload: { dragoId, options }
    }
  },
  getPoolTransactions: (dragoAddress, accounts, options) => {
    return {
      type: TYPE_.GET_POOL_TRANSACTIONS,
      payload: {
        dragoAddress,
        accounts,
        options
      }
    }
  },
  getAssetsPriceData: (assets, networkId, quoteToken) => {
    return {
      type: TYPE_.FETCH_ASSETS_PRICE_DATA,
      payload: {
        assets,
        networkId,
        quoteToken
      }
    }
  },
  getPoolsSearchList: (
    options = {
      topics: [null, null, null, null],
      fromBlock: 0,
      toBlock: 'latest',
      poolType: 'drago'
    }
  ) => {
    return {
      type: TYPE_.GET_POOLS_SEARCH_LIST,
      payload: {
        options
      }
    }
  },
  updateSelectedDrago: (results = {}, options = { reset: false }) => {
    switch (options.reset) {
      case true:
        return {
          type: TYPE_.UPDATE_SELECTED_DRAGO_DETAILS_RESET,
          payload: results
        }
      case false:
        return {
          type: TYPE_.UPDATE_SELECTED_DRAGO_DETAILS,
          payload: results
        }
      default:
        return {
          type: TYPE_.UPDATE_SELECTED_DRAGO_DETAILS,
          payload: results
        }
    }
  },
  updateDragosSearchList: results => {
    return {
      type: TYPE_.UPDATE_DRAGOS_LIST,
      payload: results
    }
  },
  updateVaultsSearchList: results => {
    return {
      type: TYPE_.UPDATE_VAULTS_LIST,
      payload: results
    }
  },
  updateTransactionsDragoHolder: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_DRAGO_HOLDER,
      payload: results
    }
  },
  updateTransactionsDragoManager: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_DRAGO_MANAGER,
      payload: results
    }
  }
}

export default drago
