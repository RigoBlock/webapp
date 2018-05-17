// Copyright 2016-2017 Rigo Investment Sarl.

// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/dom/webSocket';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/filter';
import 'rxjs/observable/timer';
import 'rxjs/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import { timer } from 'rxjs/observable/timer'
// import rp from 'request-promise'
import { 
  getOrderBookFromRelayERCDex,
  getAggregatedOrdersFromRelayERCDex
 } from '../../_utils/exchange'
// import io from 'socket.io-client'
// import ReconnectingWebSocket from 'reconnectingwebsocket'
import ReconnectingWebSocket from 'reconnecting-websocket'

import {
  ORDERBOOK_UPDATE,
  RELAY_OPEN_WEBSOCKET,
  RELAY_MSG_FROM_WEBSOCKET,
  RELAY_CLOSE_WEBSOCKET,
  RELAY_GET_ORDERS,
  ORDERBOOK_INIT

} from '../../_utils/const'


//
// GETTING ORDERS FROM RELAY ERCDex
//

// Creating an observable from the promise
const getOrderBookFromRelayERCDex$ = (networkId, baseTokenAddress, quoteTokenAddress, aggregated) =>
  aggregated 
  ? Observable.fromPromise(getAggregatedOrdersFromRelayERCDex(networkId, baseTokenAddress, quoteTokenAddress))
  : Observable.fromPromise(getOrderBookFromRelayERCDex(networkId, baseTokenAddress, quoteTokenAddress))

// Setting the epic
export const initOrderBookFromRelayERCDexEpic = (action$) =>
  action$.ofType(RELAY_GET_ORDERS)
    .mergeMap((action) => {
      console.log(action)
      console.log('initOrderBookFromRelayERCDexEpic');
      return getOrderBookFromRelayERCDex$(
        action.payload.networkId,
        action.payload.baseTokenAddress,
        action.payload.quoteTokenAddress,
        action.payload.aggregated
      )
        .map(payload => {
          const aggregate = {aggregated: action.payload.aggregated}
          return { type: ORDERBOOK_INIT, payload: { ...payload, ...aggregate } }

        })
    });

//
// GETTING UPDATES FROM RELAY ERCDex
//

function updateOrderBook(orders) {
  console.log(orders)
  return {
    type: ORDERBOOK_UPDATE,
    payload: orders
  };
}

export const webSocketReducer = (state = 0, action) => {
  switch (action.type) {
    case RELAY_OPEN_WEBSOCKET:
      console.log(RELAY_OPEN_WEBSOCKET);
      return {};
    case ORDERBOOK_UPDATE:
      console.log(action.payload)
      console.log(ORDERBOOK_UPDATE);
      return {};
    case RELAY_CLOSE_WEBSOCKET:
      console.log(RELAY_CLOSE_WEBSOCKET);
      return {};
    case RELAY_MSG_FROM_WEBSOCKET:
      console.log(RELAY_MSG_FROM_WEBSOCKET);
      return {};
    case 'RELAY_UPDATE_ORDERS':
      console.log(action)
      console.log('RELAY_UPDATE_ORDERS');
      return {};
    default:
      return state;
  }
};


// https://github.com/ReactiveX/rxjs/issues/2048

const reconnectingWebsocket$ = (baseTokenAddress, quoteTokenAddress) => {
  return Observable.create(observer => {
    var websocket = new ReconnectingWebSocket('wss://api.ercdex.com')
    websocket.addEventListener('open', (msg) => {
      console.log('WebSocket open.')
      // websocket.send(`sub:ticker`);
      websocket.send(`sub:pair-order-change/${baseTokenAddress}/${quoteTokenAddress}`);
      websocket.send(`sub:pair-order-change/${quoteTokenAddress}/${baseTokenAddress}`);
      return observer.next(msg.data);
    });
    websocket.onmessage = (msg) => {
      console.log(msg)
      return observer.next(msg.data);
    }
    websocket.onerror = (error) => {
      console.log(error)
      console.log('WebSocket error.');
      // return observer.error(error)
    };
    return () => websocket.close();
  })
}

// const socket$ = Observable.webSocket('wss://api.ercdex.com');

export const relayWebSocketEpic = (action$) =>
  action$.ofType(RELAY_OPEN_WEBSOCKET)
    .mergeMap((action) => {
      console.log(action)
      return reconnectingWebsocket$(
        action.payload.baseTokenAddress,
        action.payload.quoteTokenAddress
      )
        // .retryWhen((err) => {
        //   console.log('Retry when error');
        //   console.log(err)
        //   return window.navigator.onLine ? timer(1000) : Observable.fromEvent(window, 'online')
        // })
        .takeUntil(
          action$.ofType('RELAY_CLOSE_WEBSOCKET')
            .filter(closeAction => closeAction.ticker === action.ticker)
        )
        .map(payload => ({ type: RELAY_MSG_FROM_WEBSOCKET, payload }))
    });


export const orderBookEpic = (action$, store) => {
  const state = store.getState()
  const networkId = state.exchange.relay.networkId
  const baseTokenAddress = state.exchange.selectedTokensPair.baseToken.address
  const quoteTokenAddress = state.exchange.selectedTokensPair.quoteToken.address
  const aggregated = state.exchange.orderBook.aggregated
  return action$.ofType(RELAY_MSG_FROM_WEBSOCKET)
    .map(action => action.payload)
    .bufferTime(2000)
    .filter(value => {
      // console.log(value)
      return value.length !== 0
    })
    .bufferCount(1)
    // .map(updateOrderBook)
    .map(() => ({
      type: RELAY_GET_ORDERS,
      payload: {
        networkId,
        baseTokenAddress,
        quoteTokenAddress,
        aggregated
      }
    }))
}



