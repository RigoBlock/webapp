// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions'
import { DEBUGGING } from '../../../_utils/const'
import { Interfaces } from '../../../_utils/interfaces'
import { Observable, from, of, timer } from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  finalize,
  map,
  mergeMap,
  retryWhen,
  timeout
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { sha3_512 } from 'js-sha3'
import BigNumber from 'bignumber.js'
import shallowequal from 'shallowequal'

//
// CHECK THAT METAMASK IS UNLOCKED AND UPDATE ACTIVE ACCOUNT
//

const checkMetaMaskIsUnlocked$ = (api, web3, endpoint) => {
  let newEndpoint = { ...endpoint }
  let oldAccounts = [].concat(endpoint.accounts)
  let newAccounts = []
  let metaMaskAccountAddress = ''
  // console.log('checkMetaMaskIsUnlocked$')
  return from(web3.eth.getAccounts()).pipe(
    exhaustMap(accountsMetaMask => {
      // MM is not locked
      if (accountsMetaMask.length !== 0) {
        metaMaskAccountAddress = accountsMetaMask[0]
        // Check if a MetaMask account is already in accounts list.
        let metaMaskAccountIndex = oldAccounts.findIndex(account => {
          return account.address === metaMaskAccountAddress
        })
        if (metaMaskAccountIndex < 0) {
          const networkId = endpoint.networkInfo.id
          const blockchain = new Interfaces(api, networkId)
          return from(blockchain.attachInterfaceInfuraV2()).pipe(
            timeout(5000),
            map(result => {
              if (result.accounts.length !== 0) {
                newAccounts.push(result.accounts[0])
              }
              newEndpoint = {
                ...result
              }
              // newEndpoint.accounts = newAccounts
              // Update total ETH and GRG balance
              newEndpoint.ethBalance = newEndpoint.accounts.reduce(
                (total, account) => total.plus(account.ethBalanceWei),
                new BigNumber(0)
              )
              newEndpoint.grgBalance = newEndpoint.accounts.reduce(
                (total, account) => total.plus(account.grgBalanceWei),
                new BigNumber(0)
              )
              // console.log('attachInterfaceInfuraV2', newEndpoint)
              return newEndpoint
            }),
            catchError(err => {
              console.warn(err)
              return of(false)
            })
          )
        }
        return of(newEndpoint)
      }

      // MM is locked
      if (accountsMetaMask.length === 0) {
        // console.log('**** MM locked ****')
        let metaMaskAccountIndex = oldAccounts.findIndex(account => {
          return account.source === 'MetaMask'
        })
        // console.log(metaMaskAccountIndex)
        if (metaMaskAccountIndex !== -1) {
          newAccounts = oldAccounts.filter(account => {
            return account.source !== 'MetaMask'
          })
          // console.log(newAccounts)
          newEndpoint.accounts = newAccounts
          newEndpoint.isMetaMaskLocked = true
        }
        return of(newEndpoint)
      }
    }),
    catchError(err => {
      console.warn(err)
      return of(false)
    })
  )
}

export const checkMetaMaskIsUnlockedEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.CHECK_METAMASK_IS_UNLOCKED),
    mergeMap(action => {
      return timer(0, 1000).pipe(
        exhaustMap(() => {
          const currentState = state$.value
          return checkMetaMaskIsUnlocked$(
            action.payload.api,
            action.payload.web3,
            currentState.endpoint
          )
        }),
        timeout(5000),
        distinctUntilChanged((a, b) => {
          return shallowequal(
            JSON.stringify(a.accounts),
            JSON.stringify(b.accounts)
          )
        }),
        exhaustMap(newEndpoint => {
          console.log('***** FETCH ACCOUNT TRANSACTIONS *****')
          let optionsManager = {
            balance: false,
            supply: true,
            limit: 20,
            trader: false,
            drago: true
          }
          let optionsHolder = {
            balance: true,
            supply: false,
            limit: 20,
            trader: true,
            drago: true
          }
          let accountsAddressHash
          if (typeof newEndpoint.accounts !== 'undefined') {
            let accounts = newEndpoint.accounts.map(element => {
              return element.address
            })
            accountsAddressHash = sha3_512(accounts.toString())
          }
          let arrayObservables =
            DEBUGGING.initAccountsTransactionsInEpic &&
            !newEndpoint.isMetaMaskLocked
              ? [
                  Observable.of(
                    Actions.endpoint.getAccountsTransactions(
                      action.payload.api,
                      null,
                      newEndpoint.accounts,
                      optionsHolder
                    )
                  ),
                  Observable.of(
                    Actions.endpoint.getAccountsTransactions(
                      action.payload.api,
                      null,
                      newEndpoint.accounts,
                      optionsManager
                    )
                  ),
                  Observable.of(
                    Actions.endpoint.getAccountsTransactions(
                      action.payload.api,
                      null,
                      newEndpoint.accounts,
                      {
                        ...optionsHolder,
                        ...{
                          drago: false
                        }
                      }
                    )
                  ),
                  Observable.of(
                    Actions.endpoint.getAccountsTransactions(
                      action.payload.api,
                      null,
                      newEndpoint.accounts,
                      {
                        ...optionsManager,
                        ...{
                          drago: false
                        }
                      }
                    )
                  )
                ]
              : []
          delete newEndpoint.prevBlockNumber
          return Observable.concat(
            Observable.of(Actions.endpoint.updateInterface(newEndpoint)),
            Observable.of(
              Actions.app.updateAppStatus({
                accountsAddressHash: accountsAddressHash
              })
            ),
            ...arrayObservables
          )
        }),
        retryWhen(error => {
          let scalingDuration = 2000
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
