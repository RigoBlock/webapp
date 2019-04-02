// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions'
import { BigNumber } from '0x.js'
import { ERC20_TOKENS } from '../../../../_utils/tokens'
import {
  concat,
  filter,
  finalize,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  takeUntil
} from 'rxjs/operators'
import { defer, from, timer } from 'rxjs'
import { getBlockChunks } from '../../../../_utils/blockChain'
import { ofType } from 'redux-observable'
import { toUnitAmount } from '../../../../_utils/format'
import Web3Wrapper from '../../../../_utils/web3Wrapper/src'
import exchangeEfxV0Abi from '../../../../PoolsApi/src/contracts/abi/v2/exchange-efx-v0.json'
import utils from '../../../../_utils/utils'

const getPastExchangeEvents$ = (fund, exchange, state$) => {
  const { networkInfo } = state$.value.endpoint
  const web3 = Web3Wrapper.getInstance(networkInfo.id)
  const efxEchangeContract = new web3.eth.Contract(
    exchangeEfxV0Abi,
    exchange.exchangeAddress.toLowerCase()
  )
  const makerAddress = '0x' + fund.address.substr(2).padStart(64, '0')
  const chunkSize = 100000
  let fromBlock
  switch (networkInfo.id) {
    case 1:
      fromBlock = '6000000'
      break
    case 42:
      fromBlock = '7000000'
      break
    case 3:
      fromBlock = '3000000'
      break
    default:
      fromBlock = '3000000'
  }

  // This code may be used to filter by tokens. Do not remove.

  // console.log(
  //   '0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67'
  // )
  // let tokens1 = web3.utils.soliditySha3(
  //   {
  //     t: 'address',
  //     v: tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
  //   },
  //   {
  //     t: 'address',
  //     v: tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
  //   }
  // )
  // tokens1 = web3.utils.padLeft(tokens1, 64)
  // let tokens2 = web3.utils.soliditySha3(
  //   {
  //     t: 'address',
  //     v: tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
  //   },
  //   {
  //     t: 'address',
  //     v: tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
  //   }
  // )
  // tokens2 = web3.utils.padLeft(tokens2, 64)
  // 0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67
  // console.log(fund)

  return defer(() =>
    from(getBlockChunks(fromBlock, 'latest', chunkSize, web3))
  ).pipe(
    switchMap(chunks => {
      const eventsPromises = chunks.map(chunk => {
        const options = {
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock,
          topics: [null, makerAddress, null, null]
        }
        return efxEchangeContract.getPastEvents(
          'allEvents',
          options,
          (err, res) => (err ? err : res)
        )
      })
      return from(Promise.all(eventsPromises))
    }),
    map(events => [].concat(...events))
  )
}

const processTradesHistory = (trades, state$) => {
  let networkName = state$.value.endpoint.networkInfo.name
  let quoteTokensWrappers = new Map()
  let baseTokensWrappers = new Map()
  let tokensSymbols = new Map()
  Object.keys(state$.value.exchange.availableTradeTokensPairs).forEach(
    quoteToken => {
      quoteTokensWrappers.set(
        ERC20_TOKENS[networkName][
          quoteToken
        ].wrappers.Ethfinex.address.toLowerCase(),
        ERC20_TOKENS[networkName][quoteToken].wrappers.Ethfinex
      )
    }
  )

  Object.keys(ERC20_TOKENS[networkName]).forEach(token => {
    if (Object.keys(ERC20_TOKENS[networkName][token].wrappers).length !== 0) {
      baseTokensWrappers.set(
        ERC20_TOKENS[networkName][
          token
        ].wrappers.Ethfinex.address.toLowerCase(),
        ERC20_TOKENS[networkName][token].wrappers.Ethfinex
      )
      tokensSymbols.set(
        ERC20_TOKENS[networkName][
          token
        ].wrappers.Ethfinex.address.toLowerCase(),
        ERC20_TOKENS[networkName][token].symbolTicker.Ethfinex
      )
    }
  })

  let tradeHistory = trades.map(trade => {
    let transaction = {
      type: '',
      baseTokenSymbol: '',
      quoteTokenSymbol: '',
      transactionHash: trade.transactionHash,
      price: '0',
      amount: '0'
    }
    let makerTokenAddress = trade.returnValues.makerToken.toLowerCase()
    let takerTokenAddress = trade.returnValues.takerToken.toLowerCase()
    let makerAmount, takerAmount

    // Trade between ETH and USD

    if (
      (tokensSymbols.get(makerTokenAddress) === 'ETH' &&
        tokensSymbols.get(takerTokenAddress) === 'USD') ||
      (tokensSymbols.get(makerTokenAddress) === 'USD' &&
        tokensSymbols.get(takerTokenAddress) === 'ETH')
    ) {
      let makerTokenSymbol = tokensSymbols.get(makerTokenAddress)

      // SYMBOLS
      transaction.baseTokenSymbol = 'ETH'
      transaction.quoteTokenSymbol = 'USD'

      if (makerTokenSymbol === 'ETH') {
        transaction.type = 'sell'
        let makerDecimals = 18
        let takerDecimals = 6
        makerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledMakerTokenAmount),
          makerDecimals
        )
        takerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledTakerTokenAmount),
          takerDecimals
        )
        transaction.price = takerAmount.div(makerAmount).toFixed(5)
        transaction.amount = makerAmount.toFixed(5)
        return transaction
      } else {
        let makerDecimals = 6
        let takerDecimals = 18
        makerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledTakerTokenAmount),
          takerDecimals
        )
        takerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledMakerTokenAmount),
          makerDecimals
        )
        transaction.amount = toUnitAmount(
          new BigNumber(trade.returnValues.filledTakerTokenAmount),
          takerDecimals
        ).toFixed(5)

        transaction.price = new BigNumber(1)
          .div(new BigNumber(makerAmount).div(new BigNumber(takerAmount)))
          .toFixed(5)
        return transaction
      }
    }

    // Trade betweem ERC20 token and ETH or USD

    if (!quoteTokensWrappers.has(makerTokenAddress)) {
      transaction.type = 'sell'
      let makerDecimals = baseTokensWrappers.get(makerTokenAddress).decimals
      let takerDecimals = quoteTokensWrappers.get(takerTokenAddress).decimals
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        makerDecimals
      )

      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        takerDecimals
      )

      transaction.price = takerAmount.div(makerAmount).toFixed(5)
      transaction.amount = makerAmount.toFixed(5)

      // SYMBOLS
      transaction.baseTokenSymbol = tokensSymbols.get(makerTokenAddress)
      transaction.quoteTokenSymbol = tokensSymbols.get(takerTokenAddress)
      return transaction
    }
    if (quoteTokensWrappers.has(makerTokenAddress)) {
      transaction.type = 'buy'
      let makerDecimals = quoteTokensWrappers.get(makerTokenAddress).decimals
      let takerDecimals = baseTokensWrappers.get(takerTokenAddress).decimals
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        takerDecimals
      )

      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        takerDecimals
      )

      transaction.amount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        makerDecimals
      ).toFixed(5)

      transaction.price = new BigNumber(1)
        .div(new BigNumber(makerAmount).div(new BigNumber(takerAmount)))
        .toFixed(5)

      // SYMBOLS
      transaction.baseTokenSymbol = tokensSymbols.get(takerTokenAddress)
      transaction.quoteTokenSymbol = tokensSymbols.get(makerTokenAddress)
      return transaction
    }
  })
  return tradeHistory
}

const ethfinexEventful$ = (fund, networkInfo) => {
  const web3 = Web3Wrapper.getInstance(networkInfo.id)
  return web3.rigoblock.ob.exchangeEfxV0$.pipe(
    filter(val => {
      // TODO: verify whiy val.returnValues (return values from 0x v2 exchange) is empty object
      return val.returnValues.makerAddress.toLowerCase() === fund.address.toLowerCase()
    }),
    map(val => [val])
  )
}

export const monitorExchangeEventsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_START)),
    switchMap(action => {
      const { fund, exchange, networkInfo } = action.payload
      return getPastExchangeEvents$(fund, exchange, state$).pipe(
        concat(
          ethfinexEventful$(fund, networkInfo),
          takeUntil(
            action$.ofType(
              utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_STOP)
            )
          )
        )
      )
    }),
    filter(trades => Array.isArray(trades) && trades.length),
    map(trades => {
      let tradesHistory = processTradesHistory(trades.reverse(), state$)
      return Actions.exchange.updateTradesHistory(tradesHistory)
    }),
    retryWhen(error$ => {
      let scalingDuration = 10000
      return error$.pipe(
        mergeMap(err => {
          console.warn(err)
          return timer(scalingDuration)
        }),
        finalize(() => console.log('We are done!'))
      )
    })
  )
}

finalize(() => console.log('We are done!'))
