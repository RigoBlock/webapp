// Copyright 2016-2017 Rigo Investment Sagl.

import {
  DEFAULT_ENDPOINT,
  DEFAULT_NETWORK_NAME,
  ENDPOINTS,
  MSG_NETWORK_STATUS_OK,
  NETWORKS,
  NETWORK_OK
} from '../../_utils/const'

import { app, exchange, poolsList } from './initialState/index'

import BigNumber from 'bignumber.js'

const initialState = {
  app,
  notifications: {},
  poolsList: poolsList,
  exchange: exchange,
  transactions: {
    queue: new Map(),
    pending: 0
  },
  transactionsDrago: {
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    },
    selectedDrago: {
      values: {
        portfolioValue: -1,
        totalAssetsValue: -1,
        estimatedPrice: -1
      },
      details: {},
      transactions: [],
      assets: [],
      assetsCharts: {}
    }
  },
  transactionsVault: {
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    },
    selectedVault: {
      details: {},
      transactions: []
    }
  },
  endpoint: {
    accounts: [],
    accountsBalanceError: false,
    ethBalance: new BigNumber(0),
    grgBalance: new BigNumber(0),
    endpointInfo: ENDPOINTS[DEFAULT_ENDPOINT],
    networkInfo: NETWORKS[DEFAULT_NETWORK_NAME],
    loading: true,
    networkError: NETWORK_OK,
    networkStatus: MSG_NETWORK_STATUS_OK,
    prevBlockNumber: '0',
    prevNonce: '0',
    warnMsg: '',
    isMetaMaskNetworkCorrect: false,
    isMetaMaskLocked: true,
    lastMetaMaskUpdateTime: 0,
    openWalletSetup: false
  },
  user: {
    isManager: false
  }
}

export default initialState
