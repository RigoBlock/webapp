// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions'
import { DEBUGGING, INFURA } from '../../../_utils/const'
import { Interfaces } from '../../../_utils/interfaces'
import { Observable, defer, from, timer } from 'rxjs'
import {
  delay,
  finalize,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  takeUntil
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'
import utils from '../../../_utils/utils'

//
// CONNECT TO SOURCES OF ACCOUNTS AND POPULATE STATE WITH ACCOUNTS DATA
//

const attachInterfacePromise = async (api, endpoint) => {
  const selectedEndpointName = endpoint.endpointInfo.name
  const networkId = endpoint.networkInfo.id
  let blockchain
  try {
    blockchain = new Interfaces(api, networkId)
  } catch (err) {
    console.warn(err)
    throw new Error(`Error endpoint_epic}`)
  }
  let newEndpoint
  switch (selectedEndpointName) {
    case INFURA:
      console.log(`endpoint_epic -> ${INFURA}`)
      try {
        newEndpoint = await blockchain.attachInterfaceInfuraV2(api, networkId)
      } catch (err) {
        console.warn(err)
        throw new Error(`Error endpoint_epic -> ${INFURA}`)
      }

      break
    // case RIGOBLOCK:
    //   console.log(`endpoint_epic -> ${RIGOBLOCK}`)
    //   newEndpoint = await blockchain.attachInterfaceRigoBlockV2(api, networkId)
    //   break
    // case LOCAL:
    //   console.log(`endpoint_epic -> ${LOCAL}`)
    //   newEndpoint = await blockchain.attachInterfaceRigoBlockV2(api, networkId)
    //   break
    default:
      console.log(`endpoint_epic -> ${INFURA}`)
      try {
        newEndpoint = await blockchain.attachInterfaceInfuraV2(api, networkId)
      } catch (err) {
        console.warn(err)
        throw new Error(`Error endpoint_epic -> ${INFURA}`)
      }

      break
  }
  // console.log(newEndpoint)
  // throw new Error('error')
  return newEndpoint
}

const attachInterface$ = (api, endpoint) => {
  return defer(() =>
    attachInterfacePromise(api, endpoint).catch(error => {
      console.warn(error)
      return error
    })
  )
}

export const attachInterfaceEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.ATTACH_INTERFACE),
    switchMap(action => {
      return attachInterface$(action.payload.api, action.payload.endpoint).pipe(
        mergeMap(endpoint => {
          return Observable.concat(
            Observable.of(
              Actions.app.updateAppStatus({
                appLoading: false
                // isConnected: true
              })
            ),
            Observable.of(Actions.endpoint.updateInterface(endpoint))
          )
        })
      )
    }),
    retryWhen(error => {
      let scalingDuration = 1000
      return error.pipe(
        mergeMap((error, i) => {
          console.warn(error)
          const retryAttempt = i + 1
          console.log(`Attempt ${retryAttempt}`)
          return timer(scalingDuration)
        }),
        finalize(() => console.log('We are done!'))
      )
    })
  )

export const delayShowAppEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.ATTACH_INTERFACE),
    delay(7000),
    map(() => {
      return Actions.app.updateAppStatus({
        appLoading: false
      })
    })
  )

//
// SUBSCRIBE TO NEW BLOCK AND MONITOR ACCOUNTS
//

const monitorAccounts$ = (api, state$) => {
  const instance = Web3Wrapper.getInstance(state$.value.endpoint.networkInfo.id)
  return instance.rigoblock.ob.newBlock$.pipe(
    switchMap(newBlock => {
      return from(utils.updateAccounts(api, newBlock, state$))
    })
  )
}

export const monitorAccountsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.MONITOR_ACCOUNTS_START),
    mergeMap(action => {
      return monitorAccounts$(action.payload.api, state$).pipe(
        takeUntil(action$.pipe(ofType(TYPE_.MONITOR_ACCOUNTS_STOP))),
        mergeMap(accountsUpdate => {
          console.log(accountsUpdate)
          const observablesArray = Array(0)

          observablesArray.push(
            Observable.of(Actions.endpoint.updateInterface(accountsUpdate[0]))
          )
          if (accountsUpdate[1].length !== 0)
            observablesArray.push(
              Observable.of({
                type: TYPE_.QUEUE_ACCOUNT_NOTIFICATION,
                payload: accountsUpdate[1]
              })
            )
          if (DEBUGGING.initAccountsTransactionsInEpic) {
            const currentState = state$.value
            if (accountsUpdate[2]) {
              // if (
              //   currentState.transactionsDrago.selectedDrago.details.dragoId
              // ) {
              //   console.log('Account monitoring - > DRAGO details fetch.')
              //   observablesArray.push(
              //     Observable.of(
              //       Actions.drago.getPoolDetails(
              //         currentState.transactionsDrago.selectedDrago.details
              //           .dragoId,
              //         action.payload.api,
              //         {
              //           poolType: 'drago'
              //         }
              //       )
              //     )
              //   )
              // }

              // if (
              //   currentState.transactionsVault.selectedVault.details.vaultId
              // ) {
              //   console.log('Account monitoring - > VAULT details fetch.')
              //   observablesArray.push(
              //     Observable.of(
              //       Actions.drago.getPoolDetails(
              //         currentState.transactionsVault.selectedVault.details
              //           .vaultId,
              //         action.payload.api,
              //         {
              //           poolType: 'vault'
              //         }
              //       )
              //     )
              //   )
              // }
              // observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
              console.log(
                'Account monitoring - > DRAGO transactions fetch trader'
              )
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: true,
                      supply: false,
                      limit: 20,
                      trader: true,
                      drago: true
                    }
                  )
                )
              )
              console.log(
                'Account monitoring - > DRAGO transactions fetch manager'
              )
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: false,
                      supply: true,
                      limit: 20,
                      trader: false,
                      drago: true
                    }
                  )
                )
              )

              console.log(
                'Account monitoring - > VAULT transactions fetch manager'
              )
              observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: false,
                      supply: true,
                      limit: 20,
                      trader: false,
                      drago: false
                    }
                  )
                )
              )
              console.log(
                'Account monitoring - > VAULT transactions fetch trader'
              )
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: true,
                      supply: false,
                      limit: 20,
                      trader: true,
                      drago: false
                    }
                  )
                )
              )
            }
          }

          return Observable.concat(...observablesArray)
        }),
        retryWhen(error => {
          console.log('monitorAccountsEpic')
          let scalingDuration = 3000
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              const retryAttempt = i + 1
              console.log(` monitorAccountsEpic Attempt ${retryAttempt}`)
              // retry after 1s, 2s, etc...
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
      )
    })
  )
}
