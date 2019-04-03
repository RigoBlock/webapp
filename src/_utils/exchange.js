// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import * as abis from '../PoolsApi/src/contracts/abi'
import { KOVAN, PROD, WS } from './const'
import {
    //assetDataUtils,
    BigNumber,
    ContractWrappers,
    //generatePseudoRandomSalt,
    //Order,
    orderHashUtils,
    signatureUtils,
    //SignerType
} from '0x.js'
import { Web3Wrapper } from '@0x/web3-wrapper'
import { MetamaskSubprovider } from '@0x/subproviders'
//import { ECSignature, SignatureType, SignedOrder, ValidatorSignature } from '@0x/types';
import { SignatureType } from '@0x/types';
//import ExchangeConnectorWrapper from './exchangeConnector'
//import { EFX } from 'efx-api-node'

//import { signatureUtils, orderHashUtils } from '@0x/oder-utils' // TODO: deprecate old 0x.js library
import Web3 from 'web3'
// import ReconnectingWebSocket from 'reconnectingwebsocket'
import PoolApi from '../PoolsApi/src'
import rp from 'request-promise'

export const setAllowaceOnExchangeThroughDrago = (
  selectedFund,
  token,
  selectedExchange,
  amount
) => {
  //const web3 = account.source === 'MetaMask' ? new Web3(window.ethereum) : api
  const poolApi = new PoolApi(new Web3(window.ethereum))
  poolApi.contract.drago.init(selectedFund.details.address)

  console.log(
    'tokenTransferProxyAddress ',
    selectedExchange.tokenTransferProxyAddress
  )



  return poolApi.contract.drago.setInfiniteAllowaceOnExchange(
    selectedFund.managerAccount,
    token.address,
    selectedFund.details.address,
    selectedExchange.tokenTransferProxyAddress,
    amount
  )
}

// export const getPricesFromRelayERCdEX = () => {
//   console.log('Fetching tokens prices from ERCdEX')
//   var options = {
//     method: 'GET',
//     url: `https://api.ercdex.com/api/reports/ticker`,
//     qs: {},
//     json: true // Automatically stringifies the body to JSON
//   };
//   console.log(options)
//   return rp(options)
// }

export const getOrdersFromRelayERCdEX = (
  networkId,
  maker,
  baseTokenAddress,
  quoteTokenAddress
) => {

  if (!networkId) {
    throw new Error('networkId needs to be set')
  }
  if (!maker) {
    throw new Error('maker needs to be set')
  }
  if (!baseTokenAddress) {
    throw new Error('baseTokenAddress needs to be set')
  }
  if (!quoteTokenAddress) {
    throw new Error('quoteTokenAddress needs to be set')
  }
  let options = {
    method: 'GET',
    url: `https://api.ercdex.com/api/standard/${networkId}/v0/orders`,
    qs: {
      maker: maker,
      // tokenAddress: baseTokenAddress,
      makerTokenAddress: baseTokenAddress,
      takerTokenAddress: quoteTokenAddress
    },
    json: true // Automatically stringifies the body to JSON
  }

  return rp(options)
}

export const getTradeHistoryLogsFromRelayERCdEX = (
  networkId,
  baseTokenAddress,
  quoteTokenAddress
) => {

  if (!networkId) {
    throw new Error('networkId needs to be set')
  }
  if (!baseTokenAddress) {
    throw new Error('baseTokenAddress needs to be set')
  }
  if (!quoteTokenAddress) {
    throw new Error('quoteTokenAddress needs to be set')
  }
  let options = {
    method: 'GET',
    url: `https://api.ercdex.com/api/trade_history_logs`,
    qs: {
      networkId: networkId,
      token_address: baseTokenAddress,
      taker_token_address: quoteTokenAddress,
      maker_token_address: quoteTokenAddress
    },
    json: true // Automatically stringifies the body to JSON
  }

  return rp(options)
}

export const getHistoricalPricesDataFromERCdEX = (
  networkId,
  baseTokenAddress,
  quoteTokenAddress,
  startDate
) => {
  if (!networkId) {
    throw new Error('networkId needs to be set')
  }
  if (!baseTokenAddress) {
    throw new Error('baseTokenAddress needs to be set')
  }
  if (!quoteTokenAddress) {
    throw new Error('quoteTokenAddress needs to be set')
  }
  if (!startDate) {
    throw new Error('startDate needs to be set')
  }
  let options = {
    method: 'POST',
    url: `https://api.ercdex.com/api/reports/historical`,
    body: {
      networkId: networkId,
      baseTokenAddress: baseTokenAddress,
      quoteTokenAddress: quoteTokenAddress,
      startDate: startDate
    },
    json: true // Automatically stringifies the body to JSON
  }
  // console.log(options)
  return rp(options)
    .then(historical => {
      return historical
    })
    .catch(error => {

      return []
    })
}

// export const getOrderBookFromRelayERCdEX = (networkId, baseTokenAddress, quoteTokenAddress) => {
//   console.log('Fetching orderbook from ERCdEX')
//   if (!networkId) {
//     throw new Error('networkId needs to be set')
//   }
//   if (!baseTokenAddress) {
//     throw new Error('baseTokenAddress needs to be set')
//   }
//   if (!quoteTokenAddress) {
//     throw new Error('quoteTokenAddress needs to be set')
//   }
//   var options = {
//     method: 'GET',
//     url: `https://api.ercdex.com/api/standard/${networkId}/v0/orderbook`,
//     qs: {
//       baseTokenAddress: baseTokenAddress,
//       quoteTokenAddress: quoteTokenAddress
//     },
//     json: true // Automatically stringifies the body to JSON
//   };
//   console.log(options)
//   return rp(options)
//   .then(orders => {
//     console.log(orders)
//     const bidsOrders = formatOrders(orders.bids, 'bids')
//     const asksOrders = formatOrders(orders.asks, 'asks')
//     var spread = 0
//     if (bidsOrders.length !== 0 && asksOrders.length !== 0) {
//       spread = new BigNumber(asksOrders[asksOrders.length-1].orderPrice).minus(new BigNumber(bidsOrders[0].orderPrice)).toFixed(5)
//     } else {
//       spread = new BigNumber(0).toFixed(5)
//     }
//     return {
//       bids: bidsOrders,
//       asks: asksOrders,
//       spread
//     }
//   })
// }

// export const getAggregatedOrdersFromRelayERCdEX = (networkId, baseTokenAddress, quoteTokenAddress) => {
//   console.log('Fetching aggregated orders from ERCdEX')
//   if (!networkId) {
//     throw new Error('networkId needs to be set')
//   }
//   if (!baseTokenAddress) {
//     throw new Error('baseTokenAddress needs to be set')
//   }
//   if (!quoteTokenAddress) {
//     throw new Error('quoteTokenAddress needs to be set')
//   }
//   var options = {
//     method: 'GET',
//     uri: `https://api.ercdex.com/api/aggregated_orders`,
//     qs: {
//       networkId: networkId,
//       baseTokenAddress: baseTokenAddress,
//       quoteTokenAddress: quoteTokenAddress
//     },
//     json: true // Automatically stringifies the body to JSON
//   };
//   console.log(options)
//   return rp(options)
//   .then(orders => {
//     console.log(orders)
//     const bidsOrders = formatOrdersFromAggregate(orders.buys.priceLevels, 'bids')
//     console.log(bidsOrders)
//     const asksOrders = formatOrdersFromAggregate(orders.sells.priceLevels, 'asks')
//     console.log(asksOrders)
//     var spread = 0
//     console.log(asksOrders.length)
//     if (bidsOrders.length !== 0 && asksOrders.length !== 0) {
//       spread = new BigNumber(asksOrders[asksOrders.length-1].orderPrice).minus(new BigNumber(bidsOrders[0].orderPrice)).toFixed(5)
//     } else {
//       spread = new BigNumber(0).toFixed(5)
//     }
//     return {
//       bids: bidsOrders,
//       asks: asksOrders,
//       spread,
//       aggregated: true
//     }
//   })
// }

// export const formatOrdersFromAggregate = (orders) =>{
//   var orderPrice, orderAmount
//   let web3 = new Web3(Web3.currentProvider)
//   var formattedOrders = orders.map((order) => {
//     orderPrice = new BigNumber(order.price).toFixed(7)
//     orderAmount = new BigNumber(web3.utils.fromWei(order.volume)).toFixed(5)
//     var orderObject = {
//       orderAmount,
//       orderPrice,
//     }
//     return orderObject
//   })
//   return formattedOrders
// }

export const formatOrders = (orders, orderType) => {
  let orderPrice, orderAmount, remainingAmount
  let web3 = new Web3(Web3.currentProvider)
  let formattedOrders = orders.map(order => {
    switch (orderType) {
      case 'asks':
        orderPrice = new BigNumber(order.takerAssetAmount)
          .div(new BigNumber(order.makerAssetAmount))
          .toFixed(7)
        orderAmount = new BigNumber(
          web3.utils.fromWei(order.makerAssetAmount, 'ether')
        ).toFixed(5)
        remainingAmount = new BigNumber(
          web3.utils.fromWei(order.remainingTakerTokenAmount, 'ether')
        ).toFixed(5)
        break
      case 'bids':
        orderPrice = new BigNumber(1)
          .div(
            new BigNumber(order.takerAssetAmount).div(
              new BigNumber(order.makerAssetAmount)
            )
          )
          .toFixed(7)
        orderAmount = new BigNumber(
          web3.utils.fromWei(order.takerAssetAmount, 'ether')
        ).toFixed(5)
        remainingAmount = new BigNumber(
          web3.utils.fromWei(order.remainingTakerTokenAmount, 'ether')
        ).toFixed(5)
        break
      default:
        orderPrice = new BigNumber(order.takerAssetAmount)
          .div(new BigNumber(order.makerAssetAmount))
          .toFixed(7)
        orderAmount = new BigNumber(
          web3.utils.fromWei(order.makerAssetAmount, 'ether')
        ).toFixed(5)
        remainingAmount = new BigNumber(
          web3.utils.fromWei(order.remainingTakerTokenAmount, 'ether')
        ).toFixed(5)
    }
    let orderHash = orderHashUtils.getOrderHashHex(order)
    let orderObject = {
      order,
      dateCreated: order.dateCreated,
      orderAmount,
      remainingAmount,
      orderType,
      orderPrice,
      orderHash
    }
    return orderObject
  })
  return formattedOrders
}

export const signOrder = async (order, selectedExchange, walletAddress) => {
  const baseTokenDecimals = order.selectedTokensPair.baseToken.decimals
  const quoteTokenDecimals = order.selectedTokensPair.quoteToken.decimals

  let makerAssetAmount, takerAssetAmount
  const web3 = new Web3(window.web3)
  const providerEngine = web3.currentProvider.isMetaMask
                    ? new MetamaskSubprovider(web3.currentProvider)
                    : web3.currentProvider

  //const contractWrappers = new ContractWrappers(providerEngine, { networkId: selectedExchange.networkId })
  // Initialize the Web3Wrapper, this provides helper functions around fetching
  // account information, balances, general contract logs
  const web3Wrapper = new Web3Wrapper(providerEngine)

  const fee_rate = 0.0025 // in case of ethfinex // TODO: pass this and settle spread in dedicated subfunction

  switch (order.orderType) {
    case 'asks':

      makerAssetAmount = new BigNumber(order.orderFillAmount)
      takerAssetAmount = new BigNumber(order.orderFillAmount).times(
        new BigNumber(order.orderPrice)
      )
      .times(1 - fee_rate) // TODO: verify
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
        makerAssetAmount,
        baseTokenDecimals
      )
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
        takerAssetAmount,
        quoteTokenDecimals
      )
      break
    case 'bids':

      makerAssetAmount = new BigNumber(order.orderFillAmount).times(
        new BigNumber(order.orderPrice)
      )
      takerAssetAmount = new BigNumber(order.orderFillAmount)
      .times(1 - fee_rate) // TODO: verify
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
        makerAssetAmount,
        quoteTokenDecimals
      )
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
        takerAssetAmount,
        baseTokenDecimals
      )
      break
    default:

      makerAssetAmount = new BigNumber(order.orderFillAmount)
      takerAssetAmount = new BigNumber(order.orderFillAmount).times(
        new BigNumber(order.orderPrice)
      )
      .times(1 - fee_rate)
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
        makerAssetAmount,
        baseTokenDecimals
      )
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
        takerAssetAmount,
        quoteTokenDecimals
      )
      break
  }

/*
  const tokensAmounts = {
    makerAssetAmount,
    takerAssetAmount
  }
*/

  order.details.order.makerAssetAmount = makerAssetAmount.toString()
  order.details.order.takerAssetAmount = takerAssetAmount.toString()

  // NOTE: mock test of normal transaction
  // overwriting variables
  //const signer = await web3Wrapper.getAvailableAddressesAsync()
  //order.details.order.makerAddress = signer.toString()
  //order.details.order.expirationTimeSeconds = new BigNumber(1554209301 + 36000).toString()

  //let orderToBeSigned = { ...order.details.order, ...tokensAmounts }
  let orderToBeSigned = { ...order.details.order }
  // const fees = await getFees(orderToBeSigned, selectedExchange.networkId)
  // console.log(fees)
  // orderToBeSigned = {
  //   ...orderToBeSigned,
  //   ...fees
  // }
  // console.log(orderToBeSigned)

  const signer = await web3Wrapper.getAvailableAddressesAsync()

  const signedOrderDefaultType = await signatureUtils.ecSignOrderAsync(
    providerEngine,
    orderToBeSigned,
    signer[0]
  )

  const defaultSignature = signedOrderDefaultType.signature
  const vrsSignature = await defaultSignature.slice(0, -2)
  const signatureWallerType = await signatureUtils.convertToSignatureWithType(
    vrsSignature,
    SignatureType.Wallet // same as await vrsSignature.concat(0, 4)
  )
  signedOrderDefaultType.signature = signatureWallerType
  const signedOrderWalletType = signedOrderDefaultType

  // signature validation
  const signedOrderHashHex = await orderHashUtils.getOrderHashHex(orderToBeSigned) // or signed Order? this could lead to issues in validating
  const isValidSignature = await signatureUtils.isValidWalletSignatureAsync(
    providerEngine,
    signedOrderHashHex,
    signatureWallerType,
    order.details.order.makerAddress
    )

  const signedWalletOrder = {
      ...signedOrderDefaultType
    }
  return signedWalletOrder
}

export const submitOrderToRelayEFX = async (efxOrder, networkId) => {

  // const ZeroExConfig = {
  //   networkId: 42
  //   // exchangeAddress: this._network.id
  // }
  let relayerApiUrl
  switch (networkId) {
    case 1:
      relayerApiUrl = `https://api.ethfinex.com/trustless/v1/w/on`
      break
    case 3:
      relayerApiUrl = `https://test.ethfinex.com/trustless/v1/w/on`
      break
    case 42:
      relayerApiUrl = `https://test.ethfinex.com/trustless/v1/w/on`
      break
    default:
      relayerApiUrl = `https://test.ethfinex.com/trustless/v1/w/on`
  }
  efxOrder.fee_rate = '0.0025'
  let options = {
    method: 'POST',
    uri: relayerApiUrl,
    body: efxOrder,
    json: true // Automatically stringifies the body to JSON
  }
  return rp(options).catch(error => {
    throw Error(error)
  })
}

export const cancelOrderFromRelayEFX = async (
  orderId,
  signature,
  networkId
) => {

  // const ZeroExConfig = {
  //   networkId: 42
  //   // exchangeAddress: this._network.id
  // }
  let relayerApiUrl
  switch (networkId) {
    case 1:
      relayerApiUrl = `https://api.ethfinex.com/trustless/v1/w/oc`
      break
    case 3:
      relayerApiUrl = `https://test.ethfinex.com/trustless/v1/w/oc`
      break
    case 42:
      relayerApiUrl = `https://test.ethfinex.com/trustless/v1/w/oc`
      break
    default:
      relayerApiUrl = `https://test.ethfinex.com/trustless/v1/w/oc`
  }

  let options = {
    method: 'POST',
    uri: relayerApiUrl,
    body: { orderId, signature, protocol: '0x' },
    json: true // Automatically stringifies the body to JSON
  }
  return rp(options).catch(error => {
    throw Error(error)
  })
}

export const submitOrderToRelay = async signedOrder => {

  const ZeroExConfig = {
    networkId: 42
    // exchangeAddress: this._network.id
  }
  const relayerApiUrl = `https://api.ercdex.com/api/standard/${
    ZeroExConfig.networkId
  }/v0/order`
  // const relayerClient = new HttpClient(relayerApiUrl);
  // const response = await relayerClient.submitOrderAsync(signedOrder);
  // console.log(response)
  let options = {
    method: 'POST',
    uri: relayerApiUrl,
    body: signedOrder,
    json: true // Automatically stringifies the body to JSON
  }

  return rp(options)
}

export const softCancelOrderFromRelayERCdEX = async signedOrder => {

  const relayerApiUrl = `https://api.ercdex.com/api/orders/soft-cancel`
  // const relayerClient = new HttpClient(relayerApiUrl);
  // const response = await relayerClient.submitOrderAsync(signedOrder);
  // console.log(response)

  const signature = JSON.stringify(signedOrder.order.ecSignature)
  const oderHash = await orderHashUtils.getOrderHashHex(signedOrder.order)
  let options = {
    method: 'POST',
    uri: relayerApiUrl,
    body: {
      orderHash: oderHash,
      signature: signature
    },
    json: true // Automatically stringifies the body to JSON
  }

  return rp(options)
}

export const getFees = async (order, networkId) => {
  const relayerApiUrl = `https://api.ercdex.com/api/fees`

  let options = {
    method: 'POST',
    uri: relayerApiUrl,
    qs: {
      makerTokenAddress: order.makerTokenAddress,
      takerTokenAddress: order.takerTokenAddress,
      makerAssetAmount: new BigNumber(order.makerAssetAmount).toFixed(),
      takerAssetAmount: new BigNumber(order.takerAssetAmount).toFixed(),
      maker: order.maker,
      taker: order.taker,
      networkId: networkId
    },
    json: true // Automatically stringifies the body to JSON
  }

  return rp(options)
}

export const getTokenAllowance = async (token, ownerAddress, ZeroExConfig) => {
  if (token.symbol === 'ETH') {
    return true
  }


  const zeroEx = new ContractWrappers(window.web3.currentProvider, ZeroExConfig)
  return zeroEx.token.getProxyAllowanceAsync(token.address, ownerAddress)
}

export const setTokenAllowance = async (
  tokenAddress,
  ownerAddress,
  spenderAddress,
  ZeroExConfig
) => {
  const zeroEx = new ContractWrappers(window.web3.currentProvider, ZeroExConfig)
  return zeroEx.token.setUnlimitedAllowanceAsync(
    tokenAddress,
    ownerAddress,
    spenderAddress
  )
}

export const getAvailableAccounts = async ZeroExConfig => {
  const zeroEx = new ContractWrappers(window.web3.currentProvider, ZeroExConfig)
  return await zeroEx.getAvailableAddressesAsync()
}

export const getMarketTakerOrder = async (
  makerTokenAddress,
  takerTokenAddress,
  baseTokenAddress,
  quantity,
  networkId,
  takerAddress
) => {
  const relayerApiUrl = `https://api.ercdex.com/api/orders/best`

  let options = {
    method: 'GET',
    uri: relayerApiUrl,
    qs: {
      makerTokenAddress,
      takerTokenAddress,
      baseTokenAddress,
      quantity,
      networkId,
      takerAddress
    },
    json: true // Automatically stringifies the body to JSON
  }

  return rp(options)
}

export const fillOrderToExchange = async (
  signedOrder,
  amount,
  ZeroExConfig
) => {
  // const zeroEx = this._zeroEx
  const DECIMALS = 18
  const shouldThrowOnInsufficientBalanceOrAllowance = true
  const zeroEx = new ContractWrappers(window.web3.currentProvider, ZeroExConfig)
  const fillTakerTokenAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(amount),
    DECIMALS
  )
  const takerAddress = await zeroEx.getAvailableAddressesAsync()



  const txHash = await zeroEx.exchange.fillOrderAsync(
    signedOrder,
    fillTakerTokenAmount,
    shouldThrowOnInsufficientBalanceOrAllowance,
    takerAddress[0],
    {
      shouldValidate: false
    }
  )
  /*const txReceipt =*/ await zeroEx.awaitTransactionMinedAsync(txHash)

}

// TODO: update 0x order format
export const fillOrderToExchangeViaProxy = async (
  selectedFund,
  signedOrder,
  amount,
  ZeroExConfig
) => {
  // const zeroEx = this._zeroEx
  const DECIMALS = 18

  const order = signedOrder



  const orderAddresses = [
    order.maker,
    order.taker,
    order.makerTokenAddress,
    order.takerTokenAddress,
    order.feeRecipient
  ]
  const orderValues = [
    order.makerAssetAmount,
    order.takerAssetAmount,
    order.makerFee,
    order.takerFee,
    order.expirationUnixTimestampSec,
    order.salt
  ]
  const v = order.ecSignature.v
  const r = order.ecSignature.r
  const s = order.ecSignature.s
  const shouldThrowOnInsufficientBalanceOrAllowance = true
  console.log(
    orderAddresses,
    orderValues,
    Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), DECIMALS).toString(),
    shouldThrowOnInsufficientBalanceOrAllowance,
    v,
    r,
    s
  )

  let poolApi = null
  poolApi = new PoolApi(new Web3(window.ethereum))
  poolApi.contract.drago.init(selectedFund.details.address)
  return poolApi.contract.drago.fillOrderOnZeroExExchange(
    selectedFund.managerAccount,
    orderAddresses,
    orderValues,
    Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), DECIMALS).toString(),
    shouldThrowOnInsufficientBalanceOrAllowance,
    v,
    r,
    s,
    ZeroExConfig
  )
}

export const cancelOrderOnExchangeViaProxy = async (
  selectedFund,
  signedOrder,
  cancelTakerTokenAmount
) => {
  // const zeroEx = this._zeroEx
  const DECIMALS = 18

  const order = signedOrder


  // TODO: add senderAddress and check format
  const orderAddresses = [
    order.makerAddress,
    order.takerAddress,
    order.makerAssetData,
    order.takerAssetData,
    order.feeRecipient
  ]
  const orderValues = [
    order.makerAssetAmount,
    order.takerAssetAmount,
    order.makerFee,
    order.takerFee,
    order.expirationTimeSeconds,
    order.salt
  ]
  console.log(
    orderAddresses,
    orderValues,
    Web3Wrapper.toBaseUnitAmount(
      new BigNumber(cancelTakerTokenAmount),
      DECIMALS
    ).toString()
  )

  let poolApi = null
  poolApi = new PoolApi(new Web3(window.ethereum))
  poolApi.contract.drago.init(selectedFund.details.address)
  return poolApi.contract.drago.cancelOrderOnZeroExExchange(
    selectedFund.managerAccount,
    orderAddresses,
    orderValues,
    Web3Wrapper.toBaseUnitAmount(
      new BigNumber(cancelTakerTokenAmount),
      DECIMALS
    ).toString(),
    signedOrder.exchangeAddress
  )
}

class Exchange {
  constructor(
    endpointInfo,
    networkInfo = { name: KOVAN },
    prod = PROD,
    ws = WS
  ) {
    if (!endpointInfo) {
      throw new Error(
        'endpointInfo connection data needs to be provided to Endpoint'
      )
    }
    if (!networkInfo) {
      throw new Error('network name needs to be provided to Endpoint')
    }
    this._timeout = 1000
    this._endpoint = endpointInfo
    this._network = networkInfo
    this._exchangeAddress = this._network.zeroExExchangeContractAddress
    this._prod = prod
    this._exchangeAbi = abis.zeroExExchange
    this._tradeTokensPair = null
    this._baseTokenAddress = null
    this._quoteTokenAddress = null
    this._supportedRelays = {
      radarrelay: 'wss://ws.kovan.radarrelay.com/0x/v0/ws',
      ercdex: 'https://api.ercdex.com/api/standard'
    }
    // Infura does not support WebSocket on Kovan network yet. Disabling.
    this._onWs = ws
    /*
    this._onWs =
      this._network.name === KOVAN && this._endpoint.name === INFURA
        ? false
        : ws
    */
    // Setting production or development endpoints
    if (prod) {
      this._https = endpointInfo.https[this._network.name].prod
      this._wss = endpointInfo.wss[this._network.name].prod
    } else {
      this._https = endpointInfo.https[this._network.name].dev
      this._wss = endpointInfo.wss[this._network.name].dev
    }

    const ZeroExConfig = {
      networkId: this._network.id
      // exchangeAddress: this._network.id
    }
    this._zeroEx = new ContractWrappers(window.web3.currentProvider, ZeroExConfig)
  }

  get timeout() {
    return this._timeout
  }

  set timeout(timeout) {
    this._timeout = timeout
  }

  get tradeTokensPair() {
    return this._tradeTokensPair
  }

  set tradeTokensPair(tradeTokensPair) {
    this._baseTokenAddress = tradeTokensPair.baseToken.address
    this._quoteTokenAddress = tradeTokensPair.quoteToken.address
    this._tradeTokensPair = tradeTokensPair
  }

  init = () => {
    let api
    if (this._onWs) {
      try {


        api = new Web3(this._wss)
        api._rb = {}
        api._rb.network = this._network
        this.api = api
        return new api.eth.Contract(this._exchangeAbi, this._exchangeAddress)
      } catch (error) {

        return error
      }
    } else {
      try {


        api = new Web3(this._https)
        api._rb = {}
        api._rb.network = this._network
        this.api = api
        return new api.eth.Contract(this._exchangeAbi, this._exchangeAddress)
      } catch (error) {

        return error
      }
    }
  }

  formatOrders = (orders, orderType) => {
    let orderPrice, orderAmount
    let formattedOrders = orders.map(order => {
      switch (orderType) {
        case 'asks':
          orderPrice = new BigNumber(order.takerAssetAmount)
            .div(new BigNumber(order.makerAssetAmount))
            .toFixed(7)
          orderAmount = new BigNumber(
            this.api.utils.fromWei(order.makerAssetAmount, 'ether')
          ).toFixed(5)
          break
        case 'bids':
          orderPrice = new BigNumber(1)
            .div(
              new BigNumber(order.takerAssetAmount).div(
                new BigNumber(order.makerAssetAmount)
              )
            )
            .toFixed(7)
          orderAmount = new BigNumber(
            this.api.utils.fromWei(order.takerAssetAmount, 'ether')
          ).toFixed(5)
          break
        default:
          orderPrice = new BigNumber(1)
            .div(
              new BigNumber(order.takerAssetAmount).div(
                new BigNumber(order.makerAssetAmount)
              )
            )
            .toFixed(7)
          orderAmount = new BigNumber(
            this.api.utils.fromWei(order.takerAssetAmount, 'ether')
          ).toFixed(5)
          break
      }
      let orderHash = orderHashUtils.getOrderHashHex(order)
      let orderObject = {
        order,
        orderAmount,
        orderType,
        orderPrice,
        orderHash
      }

      return orderObject
    })
    return formattedOrders
  }

  submitOrderToRelay = async signedOrder => {

    const relayerApiUrl = 'https://api.kovan.radarrelay.com/0x/v0/order'
    let options = {
      method: 'POST',
      uri: relayerApiUrl,
      body: signedOrder,
      json: true // Automatically stringifies the body to JSON
    }

    rp(options)
      .then(function(parsedBody) {

      })
      .catch(function(err) {

      })
  }

  updateOrderToOrderBook = (order, orders, action) => {

    let orderPrice, orderAmount, orderType
    this._baseTokenAddress === order.makerTokenAddress
      ? (orderType = 'asks')
      : (orderType = 'bids')
    switch (orderType) {
      case 'asks':
        orderPrice = new BigNumber(order.takerAssetAmount)
          .div(new BigNumber(order.makerAssetAmount))
          .toFixed(7)
        orderAmount = new BigNumber(
          this.api.utils.fromWei(order.makerAssetAmount, 'ether')
        ).toFixed(5)
        break
      case 'bids':
        orderPrice = new BigNumber(1)
          .div(
            new BigNumber(order.takerAssetAmount).div(
              new BigNumber(order.makerAssetAmount)
            )
          )
          .toFixed(7)
        orderAmount = new BigNumber(
          this.api.utils.fromWei(order.takerAssetAmount, 'ether')
        ).toFixed(5)
        break
      default:
        orderPrice = new BigNumber(1)
          .div(
            new BigNumber(order.takerAssetAmount).div(
              new BigNumber(order.makerAssetAmount)
            )
          )
          .toFixed(7)
        orderAmount = new BigNumber(
          this.api.utils.fromWei(order.takerAssetAmount, 'ether')
        ).toFixed(5)
        break
    }
    // var orderHash = await orderHashUtils.getOrderHashHex(order)
    let orderObject = {
      order,
      orderAmount,
      orderType,
      orderPrice,
      orderHash: order.orderHash
    }
    let newOrders = { ...orders }

    switch (action) {
      case 'add':

        switch (orderType) {
          case 'asks':
            newOrders.asksOrders.push(orderObject)
            break
          case 'bids':
            newOrders.bidsOrders.push(orderObject)
            break
          default:
        }
        break
      case 'remove':

        switch (orderType) {
          case 'asks':
            newOrders.asksOrders = orders.asksOrders.filter(oldOrder => {
              return oldOrder.orderHash !== order.orderHash
            })
            break
          case 'bids':
            newOrders.bidsOrders = orders.bidsOrders.filter(oldOrder => {
              return oldOrder.orderHash !== order.orderHash
            })
            break
          default:
        }
        break
      default:
        newOrders = { ...orders }
    }

    return newOrders
  }
}

export default Exchange
