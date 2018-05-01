// Copyright 2016-2017 Rigo Investment Sarl.

import {
  DEFAULT_ENDPOINT,
  DEFAULT_NETWORK_NAME,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  ENDPOINTS,
  NETWORKS,
  ERC20_TOKENS
} from '../../_utils/const'
import BigNumber from 'bignumber.js';

const initialState = {
  exchange: {
    // orders: {
    //   bidsOrders: [], 
    //   asksOrders: [],
    // },
    selectedFund: {
      details: {},
      liquidity: {
        ETH: new BigNumber(0),
        WETH: new BigNumber(0),
        ZRX: new BigNumber(0),
      }
    },
    selectedTokensPair: {
      baseToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].ZRX,
      quoteToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].WETH
    },
    selectedOrder: {
      details: {},
      orderAmountError: true,
      orderPriceError: true,
      orderFillAmount: '0',
      orderMaxAmount: '0',
      orderPrice: '0',
      orderType: 'asks',
      takerOrder: false,
      selectedTokensPair: {
        baseToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].ZRX,
        quoteToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].WETH
      },
    }
  },
  transactions: {
    queue: new Map(),
  },
  transactionsDrago: {
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
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
    }
  },
  endpoint: {
    accounts: [],
    accountsBalanceError: false,
    ethBalance: new BigNumber(0),
    endpointInfo: ENDPOINTS[DEFAULT_ENDPOINT],
    networkInfo: NETWORKS[DEFAULT_NETWORK_NAME],
    loading: true,
    networkError: NETWORK_OK,
    networkStatus: MSG_NETWORK_STATUS_OK,
    prevBlockNumber: "0",
    rigoTokenBalance: null,
    warnMsg: '',
  },
  user :{
    isManager: false
  }
};

export default initialState