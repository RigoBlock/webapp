// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  UPDATE_SELECTED_FUND,
  UPDATE_SELECTED_ORDER,
  UPDATE_TRADE_TOKENS_PAIR,
  CANCEL_SELECTED_ORDER,
  ORDERBOOK_UPDATE,
  ORDERBOOK_INIT,
  ORDERBOOK_AGGREGATE_ORDERS,
  SET_MAKER_ADDRESS
} from '../../_utils/const'

function transactionsReducer(state = initialState.exchange, action) {
  switch (action.type) {
    case UPDATE_SELECTED_FUND:
      var fundDetails = action.payload
      return {
        ...state,
        selectedFund: fundDetails
      };

    case UPDATE_SELECTED_ORDER:
      var orderDetails = action.payload
      var selectedOrder = { ...state.selectedOrder, ...orderDetails }
      return {
        ...state,
        selectedOrder: selectedOrder
      };

    case UPDATE_TRADE_TOKENS_PAIR:
      return {
        ...state,
        selectedTokensPair: { ...state.selectedTokensPair, ...action.payload }
      };

    case SET_MAKER_ADDRESS:
      return {
        ...state,
        makerAddress: action.payload
      };


    case CANCEL_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: initialState.exchange.selectedOrder
      };

    case ORDERBOOK_AGGREGATE_ORDERS:
      var newOrderBook = { ...state.orderBook, ...{ aggregated: action.payload } }
      return {
        ...state,
        orderBook: newOrderBook
      };

    case ORDERBOOK_INIT:
      console.log(action)
      console.log(ORDERBOOK_INIT)
      newOrderBook = { ...state.orderBook, ...action.payload }
      // return {
      //   ...state,
      //   selectedOrder: initialState.exchange.selectedOrder
      // };
      return {
        ...state,
        orderBook: newOrderBook
      }

    case ORDERBOOK_UPDATE:
      console.log(action)
      console.log(ORDERBOOK_UPDATE)
      // return {
      //   ...state,
      //   selectedOrder: initialState.exchange.selectedOrder
      // };
      return { ...state, webSocket: { ...action.payload } }

    default: return state;
  }
}

export default transactionsReducer