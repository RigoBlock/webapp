// Copyright 2016-2017 Rigo Investment Sagl.

import * as ERRORS from '../../../_const/errors'
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { BigNumber } from '0x.js'
import { Observable, from, of, timer, zip,   concat, } from 'rxjs'
import {
  auditTime,
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMap,
  takeUntil
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import CRC from 'crc-32'
import Exchange from '../../../_utils/exchange/src'
import ExchangeConnectorWrapper from '../../../_utils/exchangeConnector'
import _ from 'lodash'
import moment from 'moment'
import utils from '../../../_utils/utils'

//
// CONNECTING TO WS AND GETTING BOOK UPDATES
//
// THIS EPIC IS CALLED WHEN THE EXCHANGE IS INITALIZED
//

const reconnectingWebsocketBook$ = (relay, networkId, baseToken, quoteToken) =>
  Observable.create(observer => {
    let seq = null

    let pair =
      utils.getTokenSymbolForRelay(relay.name, baseToken) +
      utils.getTokenSymbolForRelay(relay.name, quoteToken)
    const ethfinex = ExchangeConnectorWrapper.getNewInstance().getExchange(
      relay.name,
      {
        networkId: networkId
      }
    )
    const BOOK = {
      bids: [],
      asks: [],
      psnap: [],
      mcnt: 0
    }
    const checkCross = () => {
      let bid = BOOK.psnap.bids[0]
      let ask = BOOK.psnap.asks[0]
      if (bid >= ask) {
        let lm = [moment.utc().format(), 'bid(' + bid + ')>=ask(' + ask + ')']
        console.log(lm.join('/') + '\n')
        console.log(lm.join('/'))
      }
    }
    const unsubscribePromise = ethfinex.raw.ws
      .getAggregatedOrders(
        {
          symbols: pair,
          precision: 'P2',
          frequency: 'F1',
          len: 25
        },
        (err, msgWs) => {
          let msg = msgWs
          if (err) {
            console.warn('WebSocket order book error.')
            return observer.error(err)
          }
          if (!Array.isArray(msg)) {
            return
          }
          if (msg[1] === 'hb') {
            seq = +msg[2]
            return
          } else if (msg[1] === 'cs') {
            seq = +msg[3]

            const checksum = msg[2]
            const csdata = []
            const bids_keys = BOOK.psnap['bids']
            const asks_keys = BOOK.psnap['asks']

            for (let i = 0; i < 25; i++) {
              if (bids_keys[i]) {
                const price = bids_keys[i]
                const pp = BOOK.bids[price]
                csdata.push(pp.price, pp.amount)
              }
              if (asks_keys[i]) {
                const price = asks_keys[i]
                const pp = BOOK.asks[price]
                csdata.push(pp.price, -pp.amount)
              }
            }

            const cs_str = csdata.join(':')
            const cs_calc = CRC.str(cs_str)

            if (cs_calc !== checksum) {
              console.error('CHECKSUM_FAILED')
            }
            return
          }

          if (BOOK.mcnt === 0) {
            _.each(msg[1], function(pp) {
              pp = {
                price: pp[0],
                cnt: pp[1],
                amount: pp[2]
              }
              const side = pp.amount >= 0 ? 'bids' : 'asks'
              pp.amount = Math.abs(pp.amount)
              if (BOOK[side][pp.price]) {
                console.log(
                  '[' +
                    moment().format() +
                    '] ' +
                    pair +
                    ' | ' +
                    JSON.stringify(pp) +
                    ' BOOK snap existing bid override\n'
                )
              }
              BOOK[side][pp.price] = pp
            })
          } else {
            const cseq = +msg[2]
            msg = msg[1]

            if (!seq) {
              seq = cseq - 1
            }

            if (cseq - seq !== 1) {
              console.error('OUT OF SEQUENCE', seq, cseq)
            }

            seq = cseq

            let pp = {
              price: msg[0],
              cnt: msg[1],
              amount: msg[2]
            }

            if (!pp.cnt) {
              let found = true

              if (pp.amount > 0) {
                if (BOOK['bids'][pp.price]) {
                  delete BOOK['bids'][pp.price]
                } else {
                  found = false
                }
              } else if (pp.amount < 0) {
                if (BOOK['asks'][pp.price]) {
                  delete BOOK['asks'][pp.price]
                } else {
                  found = false
                }
              }

              if (!found) {
                console.log(
                  '[' +
                    moment().format() +
                    '] ' +
                    pair +
                    ' | ' +
                    JSON.stringify(pp) +
                    ' BOOK delete fail side not found\n'
                )
              }
            } else {
              let side = pp.amount >= 0 ? 'bids' : 'asks'
              pp.amount = Math.abs(pp.amount)
              BOOK[side][pp.price] = pp
            }
          }

          _.each(['bids', 'asks'], function(side) {
            let sbook = BOOK[side]
            let bprices = Object.keys(sbook)

            let prices = bprices.sort(function(a, b) {
              if (side === 'bids') {
                return +a >= +b ? -1 : 1
              } else {
                return +a <= +b ? -1 : 1
              }
            })
            BOOK.psnap[side] = prices
          })

          BOOK.mcnt++

          checkCross(msg)
          return observer.next({
            asks: BOOK.asks,
            bids: BOOK.bids
          })
        }
      )
      .catch(() => observer.error(ERRORS.ERR_EXCHANGE_WS_ORDERBOOK_FETCH))

    return async () => {
      const unsub = await unsubscribePromise
      if (unsub) {
        await unsub()
      }
      return ethfinex.raw.ws.close()
    }
  })

export const initRelayWebSocketBookEpic = action$ =>
  action$.pipe(
    ofType(utils.customRelayAction(TYPE_.RELAY_OPEN_WEBSOCKET_BOOK)),
    mergeMap(action => {
      const { relay, networkId, baseToken, quoteToken } = action.payload
      return reconnectingWebsocketBook$(
        relay,
        networkId,
        baseToken,
        quoteToken
      ).pipe(
        auditTime(1000),
        map(payload => {
          const calculateSpread = (asksOrders, bidsOrders) => {
            let spread = new BigNumber(0).toFixed(6)
            if (bidsOrders.length && asksOrders.length) {
              spread = new BigNumber(
                asksOrders[asksOrders.length - 1].orderPrice
              )
                .minus(new BigNumber(bidsOrders[0].orderPrice))
                .toFixed(6)
            }
            return spread
          }
          const asks = Object.values(payload.asks).map(element => {
            return {
              orderAmount: element.amount,
              orderPrice: element.price,
              orderCount: element.cnt
            }
          })
          asks.sort(function(a, b) {
            return b.orderPrice - a.orderPrice
          })
          const bids = Object.values(payload.bids).map(element => {
            return {
              orderAmount: element.amount,
              orderPrice: element.price,
              orderCount: element.cnt
            }
          })
          bids.sort(function(a, b) {
            return b.orderPrice - a.orderPrice
          })
          const spread = calculateSpread(asks, bids)
          return {
            type: TYPE_.ORDERBOOK_INIT,
            payload: {
              asks,
              bids,
              spread
            }
          }
        }),
        takeUntil(
          action$.ofType(utils.customRelayAction(TYPE_.RELAY_CLOSE_WEBSOCKET))
        ),
        catchError(error => {
          console.warn(error)
          return of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: error
          })
        })
      )
    })
  )

//
// CONNECTING TO WS AND GETTING UPDATES FOR A SPECIFIC TRADING PAIR
//
// THIS EPIC IS CALLED WHEN THE EXCHANGE IS INITALIZED
//

const websocketTicker$ = (relay, networkId, baseToken, quoteToken) =>
  Observable.create(observer => {
    const ethfinex = ExchangeConnectorWrapper.getInstance().getExchange(
      relay.name,
      {
        networkId
      }
    )
    const baseTokenSymbol = utils.getTokenSymbolForRelay(relay.name, baseToken)
    const quoteTokenSymbol = utils.getTokenSymbolForRelay(
      relay.name,
      quoteToken
    )
    const unsubscribePromise = ethfinex.raw.ws.getTickers(
      {
        symbols: [baseTokenSymbol + quoteTokenSymbol]
      },
      (err, msg) => (err ? observer.error(err) : observer.next(msg))
    )
    return async () => {
      const unsub = await unsubscribePromise
      if (unsub) {
        return unsub()
      }
    }
  })

const updateCurrentTokenPrice = ticker => {
  if (Array.isArray(ticker)) {
    const current = {
      price: ticker[6]
    }
    return Actions.exchange.updateTokenPrice(current)
  }
  return Actions.exchange.updateTokenPrice({})
}

export const initRelayWebSocketTickerEpic = (action$, state$) =>
  action$.pipe(
    ofType(utils.customRelayAction(TYPE_.RELAY_OPEN_WEBSOCKET_TICKER)),
    mergeMap(action => {
      const { relay, networkId, baseToken, quoteToken } = action.payload
      return websocketTicker$(relay, networkId, baseToken, quoteToken).pipe(
        auditTime(1000),
        filter(val => val.length),
        filter(val => {
          return val[1] !== 'hb'
        }),
        map(ticker => {
          const currentState = state$.value
          const lastItem = ticker.pop()
          return updateCurrentTokenPrice(
            lastItem,
            currentState.exchange.selectedTokensPair.baseToken
          )
        }),
        takeUntil(
          action$.ofType(utils.customRelayAction(TYPE_.RELAY_CLOSE_WEBSOCKET))
        ),
        catchError(error => {
          console.warn(error)
          return of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error connecting to price ticker.'
          })
        })
      )
    })
  )

//
// FETCH OPEN ORDERS
//

const getAccountOrdersFromRelay$ = (
  relay,
  networkId,
  account,
  baseToken,
  quoteToken
) => {
  const exchange = new Exchange(relay.name, networkId)
  return zip(
    from(exchange.getAccountOrders(account, baseToken, quoteToken)),
    from(exchange.getAccountHistory(account, baseToken, quoteToken))
  )
}

export const getAccountOrdersEpic = action$ =>
  action$.pipe(
    ofType(utils.customRelayAction(TYPE_.FETCH_ACCOUNT_ORDERS_START)),
    mergeMap(action => {
      const {
        relay,
        networkId,
        account,
        quoteToken,
        baseToken
      } = action.payload
      return timer(0, 5000).pipe(
        takeUntil(
          action$.ofType(
            utils.customRelayAction(TYPE_.FETCH_ACCOUNT_ORDERS_STOP)
          )
        ),
        exhaustMap(() =>
          getAccountOrdersFromRelay$(
            relay,
            networkId,
            account,
            quoteToken,
            baseToken
          ).pipe(
            map(orders => {
              console.log(orders)
              return {
                type: TYPE_.UPDATE_FUND_ORDERS,
                payload: {
                  open: orders[0],
                  history: orders[1]
                }
              }
            }),
            catchError(() => {
              return concat(
                of({
                  type: TYPE_.QUEUE_ERROR_NOTIFICATION,
                  payload: 'Error fetching account orders.'
                }),
                of(
                  Actions.exchange.updateAccountSignature({
                    valid: false
                  })
                )
              )
            })
          )
        )
      )
    })
  )
