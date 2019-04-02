// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
// import { Actions } from '../../actions'
import { DEBUGGING } from '../../../_utils/const'
import { Observable, throwError, merge, timer } from 'rxjs'
import {
  finalize,
  flatMap,
  mergeMap,
  retryWhen,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'

//
// SUBSCRIBES TO EVENTFULL CONTRACTS AND EMIT NEW EVENTS
//

const monitorEventful$ = state$ => {
  return merge(
    Observable.create(observer => {
      const api = Web3Wrapper.getInstance(state$.value.endpoint.networkInfo.id)
      const subscription = api.rigoblock.ob.eventful$.subscribe(val => {
        return observer.next(val)
      })
      return () => subscription.unsubscribe
    })
  )
}

export const monitorEventfulEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.MONITOR_ACCOUNTS_START),
    mergeMap(action => {
      return monitorEventful$(state$).pipe(
        takeUntil(action$.pipe(ofType(TYPE_.MONITOR_ACCOUNTS_STOP))),
        tap(val => {

          return val
        }),
        flatMap(() => {
          const observablesArray = Array(0)
          // const currentState = state$.value
          observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
          // if (currentState.transactionsDrago.selectedDrago.details.dragoId) {
          //   console.log('Account monitoring - > DRAGO details fetch.')
          //   observablesArray.push(
          //     Observable.of(
          //       Actions.drago.getPoolDetails(
          //         currentState.transactionsDrago.selectedDrago.details.dragoId,
          //
          //         {
          //           poolType: 'drago'
          //         }
          //       )
          //     )
          //   )
          // }

          // if (currentState.transactionsVault.selectedVault.details.vaultId) {
          //   console.log('Account monitoring - > VAULT details fetch.')
          //   observablesArray.push(
          //     Observable.of(
          //       Actions.drago.getPoolDetails(
          //         currentState.transactionsVault.selectedVault.details.vaultId,

          //         {
          //           poolType: 'vault'
          //         }
          //       )
          //     )
          //   )
          // }
          return Observable.concat(...observablesArray)
        }),
        retryWhen(error => {
          const maxRetryAttempts = 10
          let scalingDuration = 1000
          let excludedStatusCodes = []
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              const retryAttempt = i + 1
              // if maximum number of retries have been met
              // or response is a status code we don't wish to retry, throw error
              if (
                retryAttempt > maxRetryAttempts ||
                excludedStatusCodes.find(e => e === error.status)
              ) {
                return throwError(error)
              }
              console.log(
                `Attempt ${retryAttempt}: retrying in ${retryAttempt *
                  scalingDuration}ms`
              )
              return timer(retryAttempt + scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
      )
    })
  )
}
