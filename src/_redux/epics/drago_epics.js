// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../actions/const'
import { Actions } from '../actions/'
import { BigNumber } from 'bignumber.js'
import { ERCdEX, Ethfinex } from '../../_utils/const'
import { Observable, from, timer } from 'rxjs'
import {
  catchError,
  finalize,
  flatMap,
  map,
  mergeMap,
  retryWhen,
  takeUntil
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
// import { DEBUGGING } from '../../_utils/const'
import { ERC20_TOKENS } from '../../_utils/tokens'
import { getTokensBalances } from '../../_utils/pools/getTokensBalances'
import Web3Wrapper from '../../_utils/web3Wrapper/src'
import utils from '../../_utils/utils'

const getTokensBalances$ = (dragoAddress, networkInfo) => {
  const allowedTokens = ERC20_TOKENS[networkInfo.name]
  const web3 = Web3Wrapper.getInstance(networkInfo.id)

  return from(
    getTokensBalances(dragoAddress, allowedTokens, web3).catch(err => {
      console.warn(err)
      throw err
    })
  )
}

export const getTokensBalancesEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.GET_TOKEN_BALANCES_DRAGO),
    mergeMap(action => {
      const { networkInfo } = state$.value.endpoint
      return getTokensBalances$(action.payload.dragoDetails, networkInfo).pipe(
        map(dragoAssets => {
          const ordered = {}
          Object.keys(dragoAssets)
            .sort()
            .forEach(function(key) {
              ordered[key] = dragoAssets[key]
            })
          return ordered
        }),
        map(dragoAssets => {
          if (state$.value.app.config.isMock) {
            if (
              Object.keys(state$.value.transactionsDrago.selectedDrago.assets)
                .length === 0
            ) {
              dragoAssets = utils.generateMockAssets(networkInfo.name)
            }
          }
          return dragoAssets
        }),
        flatMap(dragoAssets => {
          const actionsArray = [
            Actions.drago.updateSelectedDrago({
              assets: Object.values(dragoAssets)
            }),
            Actions.tokens.priceTickersStart(
              action.payload.relay,
              networkInfo.id,
              dragoAssets
            )
          ]
          if (action.payload.relay.name === 'Ethfinex') {
            actionsArray.push(
              Actions.exchange.getPortfolioChartDataStart(
                action.payload.relay,
                networkInfo.id
              )
            )
          }
          return from(actionsArray)
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching fund assets balances.'
          })
        })
      )
    })
  )
}

//
// GET DETAILS FOR A DRAGO
//

const getPoolDetails$ = (poolId, networkInfo, options, state$) => {
  return Observable.create(observer => {
    let poolDetails
    const { accounts } = state$.value.endpoint
    utils
      .getPoolDetailsFromId(poolId, networkInfo)
      .then(details => {
        poolDetails = details
        return options.poolType === 'drago'
          ? observer.next({
              address: details[0][0],
              name:
                details[0][1].charAt(0).toUpperCase() + details[0][1].slice(1),
              symbol: details[0][2],
              dragoId: new BigNumber(details[0][3]).toFixed(),
              addressOwner: details[0][4],
              addressGroup: details[0][5],
              buyPrice: null,
              sellPrice: null,
              totalSupply: null,
              created: 'date loading',
              balanceDRG: null
            })
          : observer.next({
              address: details[0][0],
              name:
                details[0][1].charAt(0).toUpperCase() + details[0][1].slice(1),
              symbol: details[0][2],
              vaultId: new BigNumber(details[0][3]).toFixed(),
              addressOwner: details[0][4],
              addressGroup: details[0][5],
              buyPrice: null,
              sellPrice: null,
              totalSupply: null,
              created: 'date loading',
              balanceDRG: null,
              fee: null
            })
      })
      .then(() => {
        return options.poolType === 'drago'
          ? utils
              .getDragoDetails(poolDetails, accounts, networkInfo, options)
              .then(details => {
                return observer.next(details)
              })
              .catch(error => observer.error(error))
          : utils
              .getVaultDetails(poolDetails, accounts, networkInfo, options)
              .then(details => {
                return observer.next(details)
              })
              .catch(error => observer.error(error))
      })
      .then(() => {
        return options.poolType === 'drago'
          ? utils
              .getDragoDetails(poolDetails, accounts, networkInfo, {
                ...options,
                dateOnly: true
              })
              .then(details => {
                return observer.next(details)
              })
              .catch(error => {
                console.warn(error)
                observer.error(error)
              })
          : utils
              .getVaultDetails(poolDetails, accounts, networkInfo, {
                ...options,
                dateOnly: true
              })
              .then(details => {
                return observer.next(details)
              })
              .catch(error => {
                console.warn(error)
                observer.error(error)
              })
      })
      .catch(error => {
        console.warn(error)
        return observer.error(error)
      })
    return () => observer.complete()
  })
}

export const getPoolDetailsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.GET_POOL_DETAILS),
    mergeMap(action => {
      const { networkInfo, accounts } = state$.value.endpoint
      return getPoolDetails$(
        action.payload.dragoId,
        networkInfo,
        action.payload.options,
        state$
      ).pipe(
        flatMap(details => {
          let drago = action.payload.options.poolType === 'drago' ? true : false
          let options = {
            balance: true,
            supply: false,
            limit: 20,
            trader: !state$.value.user.isManager,
            drago: drago
          }
          let relayName
          switch (networkInfo.id) {
            case 1:
              relayName = Ethfinex
              break
            case 3:
              relayName = Ethfinex
              break
            case 42:
              relayName = Ethfinex //ERCdEX
              break
            default:
              relayName = Ethfinex
          }
          const relay = {
            name: relayName
          }
          let actionsArray = []
          if (drago) {
            actionsArray.push(
              Actions.drago.updateSelectedDrago({
                details
              })
            )
            if (details.totalSupply !== null) {
              actionsArray.push(
                Actions.drago.getPoolTransactions(
                  details.address,
                  accounts,
                  options
                ),
                Actions.drago.getTokenBalancesDrago(details.address, relay)
              )
            }
          } else {
            actionsArray.push(
              Actions.vault.updateSelectedVault({
                details
              })
            )
            if (details.totalSupply !== null) {
              actionsArray.push(
                Actions.drago.getPoolTransactions(
                  details.address,
                  accounts,
                  options
                )
              )
            }
          }
          return from(actionsArray)
        }),
        takeUntil(
          action$.pipe(
            ofType(
              TYPE_.UPDATE_SELECTED_DRAGO_DETAILS_RESET,
              TYPE_.UPDATE_SELECTED_VAULT_DETAILS_RESET
            )
          )
        ),
        retryWhen(error => {
          let scalingDuration = 5000
          return error.pipe(
            mergeMap(error => {
              console.warn(error)
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
        // catchError(error => {
        //   console.warn(error)
        //   return Observable.of({
        //     type: TYPE_.QUEUE_ERROR_NOTIFICATION,
        //     payload: 'Error fetching Pool details.'
        //   })
        // })
      )
    }),
    retryWhen(error => {
      let scalingDuration = 5000
      return error.pipe(
        mergeMap(error => {
          console.warn(error)
          return timer(scalingDuration)
        }),
        finalize(() => console.log('We are done!'))
      )
    })
  )
}
