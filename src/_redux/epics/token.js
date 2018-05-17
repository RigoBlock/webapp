// Copyright 2016-2017 Rigo Investment Sarl.
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { setTokenAllowance } from '../../_utils/exchange'
import {
  SET_TOKEN_ALLOWANCE,
  UPDATE_TRADE_TOKENS_PAIR
} from '../../_utils/const'


const setTokenAllowance$ = (tokenAddress, ownerAddress, spenderAddress, ZeroExConfig) =>
  Observable.fromPromise(setTokenAllowance(tokenAddress, ownerAddress, spenderAddress, ZeroExConfig))


export const setTokenAllowanceEpic = action$ => {
  return action$.ofType(SET_TOKEN_ALLOWANCE)
  .mergeMap((action) => {
    console.log(action)
    return setTokenAllowance$(
      action.payload.tokenAddress,
      action.payload.ownerAddress,
      action.payload.spenderAddress,
      action.payload.ZeroExConfig
    )
      .map(() => {
        return { type: UPDATE_TRADE_TOKENS_PAIR, payload: { baseTokenAllowance: true }}

      })
  });
}
