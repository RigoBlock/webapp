import { ERC20_TOKENS } from './tokens'
export { ERC20_TOKENS }

export const APP = "app";
export const APP_VERSION = "v0.2.1-beta180517"
export const DS = "/";
export const DRG_ISIN = "DR";
export const LOGGER = true;
// Set connetions to production server
export const PROD = false;
// Set connetions to WebSocketSecure or HTTPs
export const WS = true;
// Address of the Parity registry of smart contracts
export const REGISTRY_KOVAN = '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3';
// Address of RigoToken GRG
// export const GRG_ADDRESS_KV = "0x56B28058d303bc0475a34D439aa586307adAc1f5";

export const GRG = "GRG"
export const ETH = "ETH"

// Blockchain endpoint
export const EP_INFURA_KV = "https://kovan.infura.io/metamask"
export const EP_INFURA_RP = "https://ropsten.infura.io/metamask"
export const EP_INFURA_MN = "https://mainnet.infura.io/metamask"
export const EP_INFURA_KV_WS = "wss://kovan.infura.io/ws"
export const EP_INFURA_RP_WS = "wss://ropsten.infura.io/ws"
export const EP_INFURA_MN_WS = "wss://mainnet.infura.io/ws"

// Parity on ports 85xx
export const EP_RIGOBLOCK_KV_DEV = "https://srv03.endpoint.network:8545"
export const EP_RIGOBLOCK_KV_DEV_WS = "wss://srv03.endpoint.network:8546"
export const EP_RIGOBLOCK_KV_PROD = "https://kovan.endpoint.network:8545"
export const EP_RIGOBLOCK_KV_PROD_WS = "wss://kovan.endpoint.network:8546"

// Parity on ports 86xx
export const EP_RIGOBLOCK_RP_DEV = "https://srv03.endpoint.network:8645"
export const EP_RIGOBLOCK_RP_DEV_WS = "wss://srv03.endpoint.network:8646"
export const EP_RIGOBLOCK_RP_PROD = "https://ropsten.endpoint.network:8645"
export const EP_RIGOBLOCK_RP_PROD_WS = "wss://ropsten.endpoint.network:8646"

// Parity on ports 87xx
export const EP_RIGOBLOCK_MN_DEV = "https://srv03.endpoint.network:8745"
export const EP_RIGOBLOCK_MN_DEV_WS = "wss://srv03.endpoint.network:8746"
export const EP_RIGOBLOCK_MN_PROD = "https://mainnet.endpoint.network:8745"
export const EP_RIGOBLOCK_MN_PROD_WS = "wss://mainnet.endpoint.network:8746"

// Allowed endpoints in config section
export const INFURA = 'infura'
export const RIGOBLOCK = 'rigoblock'
export const LOCAL = 'local'
export const CUSTOM = 'custom'
export const ALLOWED_ENDPOINTS = [
  ['infura', false],
  ['rigoblock', false],
  ['local', false],
  ['custom', false],
]
export const PARITY_NETWORKS_ID = {
  kovan: 42,
  ropsten: 3,
  foundation: 1
}
export const DEFAULT_ENDPOINT = 'rigoblock';
// Please refert to the following link for network IDs
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
// kovan = 42
export const DEFAULT_NETWORK_NAME = 'kovan';
export const DEFAULT_NETWORK_ID = 42;
export const DEFAULT_ETHERSCAN = "https://kovan.etherscan.io/"
export const NETWORK_OK = "networkOk"
export const NETWORK_WARNING = "networkWarning"

export const KOVAN = "kovan"
export const KOVAN_ID = 42
export const ROPSTEN = "ropsten"
export const ROPSTEN_ID = 3
export const MAINNET = "mainnet"
export const MAINNET_ID = 1

export const KOVAN_ETHERSCAN = "https://kovan.etherscan.io/"
export const ROPSTEN_ETHERSCAN = "https://ropsten.etherscan.io/"
export const MAINNET_ETHERSCAN = "https://etherscan.io"

export const ENDPOINTS = {
  infura: {
    name: "infura",
    https: {
      kovan: {
        dev: "https://kovan.infura.io/metamask",
        prod: "https://kovan.infura.io/metamask"
      },
      ropsten: {
        dev: "https://ropsten.infura.io/metamask",
        prod: "https://ropsten.infura.io/metamask"
      },
      mainnet: {
        dev: "https://mainnet.infura.io/metamask",
        prod: "https://mainnet.infura.io/metamask"
      },
    },
    wss: {
      kovan: {
        dev: "wss://kovan.infura.io/ws",
        prod: "wss://kovan.infura.io/ws"
      },
      ropsten: {
        dev: "wss://ropsten.infura.io/ws",
        prod: "wss://ropsten.infura.io/ws"
      },
      mainnet: {
        dev: "wss://mainnet.infura.io/ws",
        prod: "wss://mainnet.infura.io/ws"
      },
    }
  },
  rigoblock: {
    name: "rigoblock",
    https: {
      kovan: {
        dev: "https://srv03.endpoint.network:8545",
        prod: "https://kovan.endpoint.network:8545"
      },
      ropsten: {
        dev: "https://srv03.endpoint.network:8645",
        prod: "https://ropsten.endpoint.network:8645"
      },
      mainnet: {
        dev: "wss://mainnet.endpoint.network:8945",
        prod: "https://mainnet.endpoint.network:8945"
      },
    },
    wss: {
      kovan: {
        dev: "wss://srv03.endpoint.network:8546",
        prod: "wss://kovan.endpoint.network:8546"
      },
      ropsten: {
        dev: "wss://srv03.endpoint.network:8646",
        prod: "wss://ropsten.endpoint.network:8646"
      },
      mainnet: {
        dev: "wss://mainnet.endpoint.network:8946",
        prod: "wss://mainnet.endpoint.network:8946"
      },
    }
  },
  local: {
    name: "local",
    https: {
      kovan: {
        dev: "http://localhost:8545",
        prod: "http://localhost:8545"
      },
      ropsten: {
        dev: "http://localhost:8545",
        prod: "http://localhost:8545"
      },
      mainnet: {
        dev: "http://localhost:8545",
        prod: "http://localhost:8545"
      },
    },
    wss: {
      kovan: {
        dev: "ws://localhost:8546",
        prod: "ws://localhost:8546"
      },
      ropsten: {
        dev: "ws://localhost:8546",
        prod: "ws://localhost:8546"
      },
      mainnet: {
        dev: "ws://localhost:8546",
        prod: "ws://localhost:8546"
      },
    }
  }, 
}

export const TRADE_TOKENS_PAIRS = {
  WETH: {
    GNT: "GNT",
    ZRX: "ZRX"
  }
}



export const NETWORKS = {
  kovan: {
    id: 42,
    name: "kovan",
    etherscan: "https://kovan.etherscan.io/",
    fundProxyContractAddress: "0x9fd942f59118460d7cd424ffcda39142af424245",
    zeroExExchangeContractAddress: "0x90fe2af704b34e0224bf2299c838e04d4dcf1364"
  },
  ropsten: {
    id: 3,
    name: "ropsten",
    etherscan: "https://ropsten.etherscan.io/",
    fundProxyContractAddress: ""
  },
  mainnet: {
    id: 1,
    name: "mainnet",
    etherscan: "https://etherscan.io",
    fundProxyContractAddress: "",
    zeroExExchangeContractAddress: "0x12459c951127e0c374ff9105dda097662a027093"
  }, 
}

export const EXCHANGES = {
  zeroEx: {
    kovan :{
      tokenTransferProxyAddress: "0x087eed4bc1ee3de49befbd66c662b434b15d49d4",
      exchangeContractAddress: "0x90fe2af704b34e0224bf2299c838e04d4dcf1364", 
      networkId: 42
    },
    mainnet:{

    }
  },
  rigoBlock: {
    kovan: {
      tokenTransferProxy: "0xcc040edf6e508c4372a62b1a902c69dcc52ceb1d",
      exchangeContractAddress: "0xf307de6528fa16473d8f6509b7b1d8851320dba5",
      networkId: 42
    },
    mainnet:{

    }
  }
}

// Default messages
export const MSG_NO_SUPPORTED_NETWORK = "We have detected that MetaMask is not connected to the correct network."
export const MSG_NETWORK_STATUS_OK = "Service is operating normally."
export const MSG_NETWORK_STATUS_ERROR = "Service disruption. Cannot update accounts balances. Account balances could be out of date."

// Redux actions
// Interface
export const ATTACH_INTERFACE = 'ATTACH_INTERFACE'
export const UPDATE_INTERFACE = 'UPDATE_INTERFACE'
export const ATTACH_INTERFACE_PENDING = 'ATTACH_INTERFACE_PENDING'
export const ATTACH_INTERFACE_FULFILLED = 'ATTACH_INTERFACE_FULFILLED'
export const ATTACH_INTERFACE_REJECTED = 'ATTACH_INTERFACE_REJECTED'

// User
export const IS_MANAGER = 'IS_MANAGER'

// Transactions
export const ADD_TRANSACTION = 'ADD_TRANSACTION'
export const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'

// Eventful
export const UPDATE_TRANSACTIONS_DRAGO_HOLDER = 'UPDATE_TRANSACTIONS_DRAGO_HOLDER'
export const UPDATE_TRANSACTIONS_DRAGO_MANAGER = 'UPDATE_TRANSACTIONS_DRAGO_MANAGER'
export const UPDATE_TRANSACTIONS_VAULT_HOLDER = 'UPDATE_TRANSACTIONS_VAULT_HOLDER'
export const UPDATE_TRANSACTIONS_VAULT_MANAGER = 'UPDATE_TRANSACTIONS_VAULT_MANAGER'

// EXCHANGE

// Account
export const SET_MAKER_ADDRESS = 'SET_MAKER_ADDRESS'

// Order selection
export const UPDATE_SELECTED_FUND = 'UPDATE_SELECTED_FUND'
export const UPDATE_SELECTED_ORDER = 'UPDATE_SELECTED_ORDER'
export const ORDER_UPDATE_FROM_RELAY = 'ORDER_UPDATE_FROM_RELAY'
export const UPDATE_TRADE_TOKENS_PAIR = 'UPDATE_TRADE_TOKENS_PAIR'
export const CANCEL_SELECTED_ORDER = 'CANCEL_SELECTED_ORDER'

// Orderbook
export const ORDERBOOK_UPDATE = 'ORDERBOOK_UPDATE'
export const ORDERBOOK_INIT = 'ORDERBOOK_INIT'
export const ORDERBOOK_AGGREGATE_ORDERS = 'ORDERBOOK_AGGREGATE_ORDERS'

// Websocket
export const RELAY_OPEN_WEBSOCKET = 'RELAY_OPEN_WEBSOCKET'
export const RELAY_MSG_FROM_WEBSOCKET = 'RELAY_MSG_FROM_WEBSOCKET'
export const RELAY_CLOSE_WEBSOCKET = 'RELAY_CLOSE_WEBSOCKET'
export const RELAY_GET_ORDERS = 'RELAY_GET_ORDERS'

// Tokens
export const SET_TOKEN_ALLOWANCE = 'SET_TOKEN_ALLOWANCE'




