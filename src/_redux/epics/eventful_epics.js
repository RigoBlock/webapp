// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../actions/const'
import { Actions } from '../actions'
// import { DEBUGGING } from '../../_utils/const'
import { Observable, from, timer } from 'rxjs'
import {
  catchError,
  delay,
  finalize,
  map,
  mergeMap,
  retryWhen
} from 'rxjs/operators'
import { exhaustMap } from 'rxjs-compat/operator/exhaustMap'
import { ofType } from 'redux-observable'
import BigNumber from 'bignumber.js'
import PoolsApi from '../../PoolsApi/src'
import utils from '../../_utils/utils'
// import { race } from 'rxjs/observable/race';

//
// FETCH LIST OF DRAGOS
//

const getVaultsChunkedEvents$ = (api, options, state$) => {
  return Observable.create(observer => {
    let startBlock =
      state$.value.transactionsVault.vaultsList.lastFetchRange.lastBlock

    const poolApi = new PoolsApi(api)
    if (startBlock === 0) {
      switch (api._rb.network.id) {
        case 1:
          startBlock = '6000000'
          break
        case 42:
          startBlock = '7000000'
          break
        case 3:
          startBlock = '3000000'
          break
        default:
          startBlock = '3000000'
      }
    }

    const logToEvent = log => {
      const hexToString = hex => {
        let string = ''
        for (let i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return string
      }
      const { returnValues } = log
      let symbol
      if (typeof returnValues.symbol === 'string') {
        '0x' === returnValues.symbol.substring(0, 2)
          ? (symbol = hexToString(returnValues.symbol.substring(2)))
          : (symbol = returnValues.symbol)
      } else {
        for (let i = 0; i < returnValues.symbol.length; ++i) {
          symbol += String.fromCharCode(returnValues.symbol[i])
        }
      }
      return {
        symbol,
        vaultId: returnValues.vaultId,
        name: returnValues.name,
        address: returnValues.vault
      }
    }

    poolApi.contract.vaulteventful
      .init()
      .then(() => {
        api.eth
          .getBlockNumber()
          .then(async lastBlock => {
            lastBlock = new BigNumber(lastBlock).toNumber()
            let chunck = 100000
            const chunks = await utils.blockChunks(
              startBlock,
              lastBlock,
              chunck
            )
            chunks.map(async (chunk, key) => {
              // Pushing chunk logs into array
              let options = {
                topics: [
                  poolApi.contract.vaulteventful.hexSignature.VaultCreated,
                  null,
                  null,
                  null
                ],
                fromBlock: chunk.fromBlock,
                toBlock: chunk.toBlock
              }
              poolApi.contract.vaulteventful
                .getAllLogs(options)
                .then(logs => {
                  const list = [].concat(logs.map(logToEvent))
                  let result = {
                    list,
                    lastFetchRange: {
                      chunk: {
                        key: key,
                        toBlock:
                          chunk.toBlock === 'latest'
                            ? Number(lastBlock)
                            : Number(chunk.toBlock),
                        fromBlock: chunk.fromBlock
                      },
                      startBlock: Number(startBlock),
                      lastBlock: Number(lastBlock)
                    }
                  }
                  return observer.next(result)
                })
                .catch(error => {
                  return observer.error(error)
                })
            })
          })
          .catch(error => {
            console.warn(error)
            return observer.error(error)
          })
      })
      .catch(error => {
        console.warn(error)
        return observer.error(error)
      })
  })
}

const getDragosChunkedEvents$ = (api, options, state$) => {
  return Observable.create(observer => {
    let startBlock =
      state$.value.transactionsDrago.dragosList.lastFetchRange.lastBlock
    // console.log(fromBlock)
    const poolApi = new PoolsApi(api)
    if (startBlock === 0) {
      switch (api._rb.network.id) {
        case 1:
          startBlock = '6000000'
          break
        case 42:
          startBlock = '7000000'
          break
        case 3:
          startBlock = '3000000'
          break
        default:
          startBlock = '3000000'
      }
    }

    const logToEvent = log => {
      const hexToString = hex => {
        let string = ''
        for (let i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return string
      }
      const { returnValues } = log
      let symbol
      if (typeof returnValues.symbol === 'string') {
        '0x' === returnValues.symbol.substring(0, 2)
          ? (symbol = hexToString(returnValues.symbol.substring(2)))
          : (symbol = returnValues.symbol)
      } else {
        for (let i = 0; i < returnValues.symbol.length; ++i) {
          symbol += String.fromCharCode(returnValues.symbol[i])
        }
      }
      return {
        symbol,
        dragoId: returnValues.dragoId,
        name: returnValues.name,
        address: returnValues.drago
      }
    }

    poolApi.contract.dragoeventful
      .init()
      .then(() => {
        api.eth
          .getBlockNumber()
          .then(async lastBlock => {
            lastBlock = new BigNumber(lastBlock).toNumber()
            let chunck = 100000
            // console.log(startBlock, lastBlock, chunck)
            const chunks = await utils.blockChunks(
              startBlock,
              lastBlock,
              chunck
            )
            chunks.map(async (chunk, key) => {
              // Pushing chunk logs into array
              let options = {
                topics: [
                  poolApi.contract.dragoeventful.hexSignature.DragoCreated,
                  null,
                  null,
                  null
                ],
                fromBlock: chunk.fromBlock,
                toBlock: chunk.toBlock
              }
              poolApi.contract.dragoeventful
                .getAllLogs(options)
                .then(logs => {
                  const list = [].concat(logs.map(logToEvent))
                  let result = {
                    list,
                    lastFetchRange: {
                      chunk: {
                        key: key,
                        toBlock:
                          chunk.toBlock === 'latest'
                            ? Number(lastBlock)
                            : Number(chunk.toBlock),
                        fromBlock: chunk.fromBlock
                      },
                      startBlock: Number(startBlock),
                      lastBlock: Number(lastBlock)
                    }
                  }
                  // console.log(result)
                  return observer.next(result)
                })
                .catch(error => {
                  console.warn(error)
                  return observer.error(error)
                })
            })
          })
          .catch(error => {
            console.warn(error)
            return observer.error(error)
          })
      })
      .catch(error => {
        console.warn(error)
        return observer.error(error)
      })
  })
}

const getPoolsList$ = (api, options, state$) => {
  switch (options.poolType) {
    case 'drago':
      return getDragosChunkedEvents$(api, options, state$)
    case 'vault':
      return getVaultsChunkedEvents$(api, options, state$)
    default:
      return getDragosChunkedEvents$(api, options, state$)
  }
}

export const getPoolsListEpic = (action$, state$) =>
  action$.pipe(
    ofType(TYPE_.GET_POOLS_SEARCH_LIST),
    mergeMap(action => {
      return getPoolsList$(
        action.payload.api,
        action.payload.options,
        state$
      ).pipe(
        map(results => {
          // console.log(results)
          switch (action.payload.options.poolType) {
            case 'drago':
              return Actions.drago.updateDragosSearchList(results)
            case 'vault':
              return Actions.drago.updateVaultsSearchList(results)
            default:
              throw Error('No poolType defined')
          }
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching list of dragos.'
          })
        })
      )
    })
  )

//
// FETCH ACCOUNT TRANSACTIONS
//

const getPoolTransactions$ = (api, dragoAddress, accounts, options) => {
  return options.drago
    ? from(
        utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      )
    : from(
        utils.getTransactionsVaultOptV2(api, dragoAddress, accounts, options)
      )
}

export const getAccountsTransactionsEpic = (action$, state$) => {
  const retryStrategy = error$ =>
    error$.pipe(
      exhaustMap(err => err),
      delay(2000)
    )

  // const isNodeConnected$ = state$.pipe(
  //   map(val => {
  //     // console.log(val)
  //     return !val.app.isConnected
  //   }),
  //   tap(val => {
  //     console.log(val)
  //     return val
  //   }),
  //   skipWhile(val => val === true),
  //   tap(val => {
  //     console.log('not skipped')
  //     return val
  //   }),
  //   map(val => {
  //     return val
  //   })
  // )

  return action$.pipe(
    ofType(TYPE_.GET_ACCOUNTS_TRANSACTIONS),
    mergeMap(action => {
      return getPoolTransactions$(
        action.payload.api,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      ).pipe(
        map(results => {
          if (action.payload.options.drago) {
            if (!action.payload.options.trader) {
              return Actions.drago.updateTransactionsDragoManager(
                results.length === 0 ? [Array(0), Array(0), Array(0)] : results
              )
            }
            return Actions.drago.updateTransactionsDragoHolder(results)
            // return DEBUGGING.DUMB_ACTION
          } else {
            if (!action.payload.options.trader) {
              return Actions.vault.updateTransactionsVaultManager(
                results.length === 0 ? [Array(0), Array(0), Array(0)] : results
              )
            }
            return Actions.vault.updateTransactionsVaultHolder(results)
            // return DEBUGGING.DUMB_ACTION
          }
        }),
        retryWhen(error => {
          console.warn('getAccountsTransactionsEpic error')
          let scalingDuration = 10000
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
      )
    })
  )
}

//
// FETCH POOL TRANSACTIONS
//

export const getPoolTransactionsEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.GET_POOL_TRANSACTIONS),
    mergeMap(action => {
      return getPoolTransactions$(
        action.payload.api,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      ).pipe(
        map(results => {
          if (action.payload.options.drago) {
            return Actions.drago.updateSelectedDrago({
              transactions: results
            })
          } else {
            return Actions.vault.updateSelectedVault({
              transactions: results
            })
          }
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching account transactions.'
          })
        })
      )
    })
  )
