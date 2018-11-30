// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../actions/'
import { Observable, from, timer } from 'rxjs'
import PoolApi from '../../PoolsApi/src'

import * as TYPE_ from '../actions/const'
import {
  catchError,
  finalize,
  flatMap,
  map,
  mergeMap,
  retryWhen,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { BigNumber } from '../../../node_modules/bignumber.js/bignumber'
import { ERCdEX, Ethfinex } from '../../_utils/const'
// import { DEBUGGING } from '../../_utils/const'
import { ERC20_TOKENS } from '../../_utils/tokens'
import Web3Wrapper from '../../_utils/web3Wrapper/src'
import utils from '../../_utils/utils'

const getTokensBalances$ = (dragoAddress, api) => {
  //
  // Initializing Drago API
  //

  let web3 = Web3Wrapper.getInstance(api._rb.network.id)
  web3._rb = window.web3._rb
  const poolApi = new PoolApi(web3)
  // const poolApi = new PoolApi(api)
  try {
    poolApi.contract.drago.init(dragoAddress)
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  const getTokensBalances = async () => {
    let allowedTokens = ERC20_TOKENS[api._rb.network.name]
    let dragoAssets = {}
    for (let token in allowedTokens) {
      let balances = {
        token: new BigNumber(0),
        wrappers: {},
        total: new BigNumber(0)
      }
      let tokenAddress = allowedTokens[token].address.toLowerCase()
      if (tokenAddress !== '0x0') {
        let total = new BigNumber(0)
        try {
          balances.token = await poolApi.contract.drago.getPoolBalanceOnToken(
            tokenAddress
          )
          // console.log(`${token} - ${allowedTokens[token].address} -> ${balances.token}`)
          total = total.plus(balances.token)
          if (typeof allowedTokens[token].wrappers !== 'undefined') {
            for (let wrapper in allowedTokens[token].wrappers) {
              let wrapperAddess = allowedTokens[token].wrappers[wrapper].address
              balances.wrappers[
                wrapper
              ] = await poolApi.contract.drago.getPoolBalanceOnToken(
                wrapperAddess
              )
              total = total.plus(balances.wrappers[wrapper])
            }
          }
          // Only add tokens with balance > 0
          if (!total.eq(0)) {
            balances.total = total
            dragoAssets[token] = allowedTokens[token]
            dragoAssets[token].balances = balances
          }
        } catch (err) {
          console.warn(err)
          throw err
        }
      } else {
      }
    }
    return dragoAssets
  }
  return from(
    getTokensBalances().catch(err => {
      console.warn(err)
      throw err
    })
  )
}

export const getTokensBalancesEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.GET_TOKEN_BALANCES_DRAGO),
    mergeMap(action => {
      return getTokensBalances$(
        action.payload.dragoDetails,
        action.payload.api
      ).pipe(
        map(dragoAssets => {
          const ordered = {}
          Object.keys(dragoAssets)
            .sort()
            .forEach(function(key) {
              ordered[key] = dragoAssets[key]
            })
          return ordered
        }),
        tap(val => {
          console.log(val)
          return val
        }),
        map(dragoAssets => {
          if (state$.value.app.config.isMock) {
            if (
              Object.keys(state$.value.transactionsDrago.selectedDrago.assets)
                .length === 0
            ) {
              const networkName = state$.value.endpoint.networkInfo.name
              dragoAssets = utils.generateMockAssets(networkName)
            }
          }
          return dragoAssets
        }),
        flatMap(dragoAssets => {
          let observablesArray = [
            Actions.drago.updateSelectedDrago({
              assets: Object.values(dragoAssets)
            }),
            Actions.tokens.priceTickersStart(
              action.payload.relay,
              action.payload.api._rb.network.id,
              dragoAssets
            )
          ]
          if (action.payload.relay.name === 'Ethfinex') {
            observablesArray.push(
              Actions.exchange.getPortfolioChartDataStart(
                action.payload.relay,
                action.payload.api._rb.network.id
              )
            )
          }
          return Observable.concat(observablesArray)
        }),
        catchError(error => {
          console.log(error)
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

const getPoolDetails$ = (poolId, api, options, state$) => {
  return Observable.create(observer => {
    let poolDetails
    utils
      .getPoolDetailsFromId(poolId, api)
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
              created: '01 January 1970',
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
              created: '01 January 1970',
              balanceDRG: null,
              fee: null
            })
      })
      .then(() => {
        const accounts = state$.value.endpoint.accounts
        return options.poolType === 'drago'
          ? utils
              .getDragoDetails(poolDetails, accounts, api)
              .then(details => {
                return observer.next(details)
              })
              .catch(error => observer.error(error))
          : utils
              .getVaultDetails(poolDetails, accounts, api)
              .then(details => {
                return observer.next(details)
              })
              .catch(error => observer.error(error))
      })
      .then(() => {
        const accounts = state$.value.endpoint.accounts
        return options.poolType === 'drago'
          ? utils
              .getDragoDetails(poolDetails, accounts, api, { dateOnly: true })
              .then(details => {
                return observer.next(details)
              })
              .catch(error => {
                console.warn(error)
                observer.error(error)
              })
          : utils
              .getVaultDetails(poolDetails, accounts, api, { dateOnly: true })
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
      return getPoolDetails$(
        action.payload.dragoId,
        action.payload.api,
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
          switch (action.payload.api._rb.network.id) {
            case 1:
              relayName = Ethfinex
              break
            case 3:
              relayName = Ethfinex
              break
            case 42:
              relayName = ERCdEX
              break
            default:
              relayName = Ethfinex
          }
          const relay = {
            name: relayName
          }
          let observablesArray = []
          if (drago) {
            observablesArray.push(
              Actions.drago.updateSelectedDrago({
                details
              })
            )
            if (details.totalSupply !== null) {
              observablesArray.push(
                Actions.drago.getPoolTransactions(
                  action.payload.api,
                  details.address,
                  state$.value.endpoint.accounts,
                  options
                ),
                Actions.drago.getTokenBalancesDrago(
                  details.address,
                  action.payload.api,
                  relay
                )
              )
            }
          } else {
            observablesArray.push(
              Actions.vault.updateSelectedVault({
                details
              })
            )
            if (details.totalSupply !== null) {
              observablesArray.push(
                Actions.drago.getPoolTransactions(
                  action.payload.api,
                  details.address,
                  state$.value.endpoint.accounts,
                  options
                )
                // Actions.drago.getTokenBalancesDrago(
                //   details.address,
                //   action.payload.api,
                //   relay
                // )
              )
            }
          }
          return Observable.concat(observablesArray)

          // return DEBUGGING.DUMB_ACTION
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
