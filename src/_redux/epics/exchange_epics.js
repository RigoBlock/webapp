// Copyright 2016-2017 Rigo Investment Sagl.

import * as ERRORS from '../../_const/errors'
import * as TYPE_ from '../actions/const'
import { Actions } from '../actions/'
import { Observable, from, timer } from 'rxjs'
import {
  catchError,
  concat,
  exhaustMap,
  map,
  mergeMap,
  skipWhile,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators'
import { getTradeHistoryLogsFromRelayERCdEX } from '../../_utils/exchange'
import { ofType } from 'redux-observable'
import BigNumber from 'bignumber.js'
import Exchange from '../../_utils/exchange/src/index'

import utils from '../../_utils/utils'

export * from './exchanges'

//
// GETTING ORDERS FROM RELAY
//

// Creating an observable from the promise
const getOrderBookFromRelay$ = (
  relay,
  networkId,
  baseToken,
  quoteToken,
  aggregated
) => {
  // console.log(aggregated)
  if (aggregated) {
    const exchange = new Exchange(relay.name, networkId)
    return from(
      exchange.getAggregatedOrders(
        utils.getTokenSymbolForRelay(relay.name, baseToken),
        utils.getTokenSymbolForRelay(relay.name, quoteToken)
      )
    )
    // console.log(supportedExchanges.ETHFINEX)
    // console.log(supportedExchanges.ETHFINEX_RAW)
    // console.log(relay.name)

    // const baseTokenSymbol = utils.getTokenSymbolForRelay(relay.name, baseToken)
    // const quoteTokenSymbol = utils.getTokenSymbolForRelay(
    //   relay.name,
    //   quoteToken
    // )
    // const ethfinex = exchangeConnector(relay.name, {
    //   networkId: networkId
    // })
    // return from(
    //   ethfinex.http
    //     .getOrders({
    //       symbols: baseTokenSymbol + quoteTokenSymbol,
    //       precision: exchanges[relay.name + 'Raw'].OrderPrecisions.P2
    //     })
    //     .then(orders => {
    //       console.log(orders)
    //     })
    //     .catch(error => {
    //       console.log('error')
    //       console.log(error)
    //     })
    // )
  } else {
    const exchange = new Exchange(relay.name, networkId)
    // console.log('not aggregated')
    return from(
      exchange.getOrders(
        utils.getTokenSymbolForRelay(relay.name, baseToken),
        utils.getTokenSymbolForRelay(relay.name, quoteToken)
      )
    )
  }
}

// Setting the epic
export const getOrderBookFromRelayEpic = action$ => {
  return action$.pipe(
    ofType(TYPE_.RELAY_GET_ORDERS),
    mergeMap(action => {
      return getOrderBookFromRelay$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken,
        action.payload.aggregated
      ).pipe(
        map(payload => {
          // console.log(payload)
          return { type: TYPE_.ORDERBOOK_INIT, payload: { ...payload } }
        }),
        catchError(error => {
          console.log(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: ERRORS.ERR_EXCHANGE_ORDER_BOOK_FETCH
          })
        })
      )
    })
  )
}

//
// UPDATE TOKEN WRAPPER LOCK TIME
//

// const getTokenWrapperLockTime$ = (fundAddress, api) =>
//   Observable.fromPromise(utils.getDragoLiquidity(fundAddress, api)).map(
//     liquidity => {
//       const payload = {
//         liquidity: {
//           ETH: liquidity[0],
//           WETH: liquidity[1],
//           ZRX: liquidity[2]
//         }
//       }
//       return {
//         type: TYPE_.UPDATE_SELECTED_FUND,
//         payload: payload
//       }
//     }
//   )

// export const updateTokenWrapperLockTimeEpic = action$ => {
//   return action$.pipe(
//     ofType(TYPE_.UPDATE_TOKEN_WRAPPER_LOCK_TIME),
//     switchMap(action => {
//       return getTokenWrapperLockTime$(action.payload.api, action.payload.api)
//     })
//   )
// }

//
// UPDATE FUND LIQUIDITY
//

// const updateFundLiquidity$ = (fundAddress, api) =>
//   Observable.from(utils.getDragoLiquidity(fundAddress, api)).pipe(
//     map(liquidity => {
//       const payload = {
//         liquidity: {
//           ETH: liquidity[0]
//           // WETH: liquidity[1],
//           // ZRX: liquidity[2]
//         }
//       }
//       return {
//         type: TYPE_.UPDATE_SELECTED_FUND,
//         payload: payload
//       }
//     })
//   )

// export const updateFundLiquidityEpic = action$ => {
//   return action$.pipe(
//     ofType(TYPE_.UPDATE_FUND_LIQUIDITY),
//     mergeMap(action => {
//       return Observable.pipe(
//         concat(
//           Observable.of({
//             type: TYPE_.UPDATE_ELEMENT_LOADING,
//             payload: { liquidity: true }
//           }),
//           updateFundLiquidity$(action.payload.fundAddress, action.payload.api),
//           Observable.of({
//             type: TYPE_.UPDATE_ELEMENT_LOADING,
//             payload: { liquidity: false }
//           })
//         )
//       )
//     })
//   )
// }

//
// UPDATE LIQUIDITY AND TOKEN BALANCES IN FUND
//

const updateLiquidityAndTokenBalances$ = (api, fundAddress, currentState) => {
  // const tokens = {
  //   baseToken: currentState.exchange.selectedTokensPair.baseToken,
  //   quoteToken: currentState.exchange.selectedTokensPair.quoteToken
  // }
  const exchange = Object.assign(currentState.exchange.selectedRelay)
  const selectedTokensPair = Object.assign(
    currentState.exchange.selectedTokensPair
  )
  return from(
    utils.getDragoLiquidityAndTokenBalances(
      fundAddress,
      api,
      selectedTokensPair,
      exchange
    )
  ).pipe(
    mergeMap(liquidity => {
      // console.log(liquidity)
      const payload = {
        loading: false,
        liquidity: {
          ETH: liquidity.dragoETHBalance,
          baseToken: {
            balance: liquidity.baseTokenBalance,
            balanceWrapper: liquidity.baseTokenWrapperBalance
          },
          quoteToken: {
            balance: liquidity.quoteTokenBalance,
            balanceWrapper: liquidity.quoteTokenWrapperBalance
          }
        }
      }
      // console.log(payload)
      return Observable.concat(
        Observable.of(Actions.exchange.updateSelectedFund(payload)),
        Observable.of(
          Actions.exchange.updateSelectedTradeTokensPair({
            baseTokenLockWrapExpire: liquidity.baseTokenLockWrapExpire,
            quoteTokenLockWrapExpire: liquidity.quoteTokenLockWrapExpire
          })
        )
      )
    })
  )
}

export const getLiquidityAndTokenBalancesEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.UPDATE_LIQUIDITY_AND_TOKENS_BALANCE),
    exhaustMap(action => {
      const currentState = state$.value
      return updateLiquidityAndTokenBalances$(
        action.payload.api,
        action.payload.dragoAddress,
        currentState
      )
    })
  )
}

export const resetLiquidityAndTokenBalancesEpic = action$ => {
  return action$.pipe(
    ofType(TYPE_.UPDATE_LIQUIDITY_AND_TOKENS_BALANCE_RESET),
    exhaustMap(() => {
      console.log(TYPE_.UPDATE_LIQUIDITY_AND_TOKENS_BALANCE_RESET)
      const payload = {
        loading: false,
        liquidity: {
          ETH: new BigNumber(0),
          baseToken: {
            balance: new BigNumber(0),
            balanceWrapper: new BigNumber(0)
          },
          quoteToken: {
            balance: new BigNumber(0),
            balanceWrapper: new BigNumber(0)
          }
        }
      }
      return Observable.concat(
        Observable.of(Actions.exchange.updateSelectedFund(payload))
      )
    })
  )
}

export const updateLiquidityAndTokenBalancesEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.UPDATE_LIQUIDITY_AND_TOKENS_BALANCE_START),
    switchMap(action => {
      return timer(0, 10000).pipe(
        takeUntil(
          action$.pipe(ofType(TYPE_.UPDATE_LIQUIDITY_AND_TOKENS_BALANCE_STOP))
        ),
        skipWhile(
          () =>
            typeof state$.value.exchange.selectedFund.details.address ===
            'undefined'
        ),
        tap(val => {
          // console.log('*** Update liquidity ***')
          // console.log(val)
          return val
        }),
        exhaustMap(() => {
          const currentState = state$.value
          return updateLiquidityAndTokenBalances$(
            action.payload.api,
            currentState.exchange.selectedFund.details.address,
            currentState
          )
        })
      )
    })
  )
}

//
// FETCH HISTORICAL TRANSCATION LOGS DATA
//

const getTradeHistoryLogsFromRelayERCdEX$ = (
  networkId,
  baseTokenAddress,
  quoteTokenAddress
) =>
  Observable.from(
    getTradeHistoryLogsFromRelayERCdEX(
      networkId,
      baseTokenAddress,
      quoteTokenAddress
    )
  )

export const getTradeHistoryLogsFromRelayERCdEXEpic = action$ => {
  return action$.pipe(
    ofType(TYPE_.FETCH_HISTORY_TRANSACTION_LOGS),
    mergeMap(action => {
      return Observable.pipe(
        concat(
          // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true }}),
          getTradeHistoryLogsFromRelayERCdEX$(
            action.payload.networkId,
            action.payload.baseTokenAddress,
            action.payload.quoteTokenAddress
          ).pipe(
            map(logs => {
              // const payload = historical.map(entry =>{
              //   const date = new Date(entry.date)
              //   entry.date = date
              //   return entry
              // })
              // console.log(payload)
              // console.log(logs)
              return {
                type: TYPE_.UPDATE_HISTORY_TRANSACTION_LOGS,
                payload: logs
              }
            })
          )
          // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false }}),
        )
      )
    })
  )
}
