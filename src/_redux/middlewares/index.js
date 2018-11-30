// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import * as TYPE_ from '../actions/const'
import { Actions } from '../actions'
import BigNumber from 'bignumber.js'
import serializeError from 'serialize-error'
import utils from '../../_utils/utils'

export const relayActionsMiddleWare = store => next => action => {
  const state = store.getState()
  if (TYPE_.CUSTOM_EXCHANGE_ACTIONS.includes(action.type)) {
    action.type = `${state.exchange.selectedRelay.name.toUpperCase()}_${
      action.type
    }`
  }
  next(action)
}

export const notificationsMiddleWare = store => next => action => {
  const state = store.getState()
  if (action.type === TYPE_.QUEUE_ACCOUNT_NOTIFICATION) {
    action.payload.forEach(notification => {
      utils.notificationAccount(
        state.notifications.engine,
        notification,
        'info'
      )
    })
  }
  if (action.type === TYPE_.QUEUE_ERROR_NOTIFICATION) {
    utils.notificationError(
      state.notifications.engine,
      serializeError(action.payload),
      'error'
    )
  }
  if (action.type === TYPE_.QUEUE_WARNING_NOTIFICATION) {
    utils.notificationError(
      state.notifications.engine,
      serializeError(action.payload),
      'warning'
    )
  }
  next(action)
}

export const poolCalculateValueMiddleWare = store => next => action => {
  if (action.type === TYPE_.TOKENS_TICKERS_UPDATE) {
    const state = store.getState()
    const { assets } = state.transactionsDrago.selectedDrago
    let { current } = state.exchange.prices
    const { details } = state.transactionsDrago.selectedDrago
    current = { ...current, ...action.payload }
    const portfolioValue = utils.calculatePortfolioValue(assets, current)
    let estimatedPrice
    if (new BigNumber(details.totalSupply).eq(0)) {
      estimatedPrice = '0.0000'
    } else {
      estimatedPrice = new BigNumber(portfolioValue)
        .plus(new BigNumber(details.dragoETHBalance))
        .div(new BigNumber(details.totalSupply))
        .toFixed(4)
    }
    store.dispatch(
      Actions.drago.updateSelectedDrago({
        values: {
          portfolioValue,
          estimatedPrice
        }
      })
    )
  }
  next(action)
}
