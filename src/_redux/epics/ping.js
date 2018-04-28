// Copyright 2016-2017 Rigo Investment Sarl.
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

const PING = 'PING';
var orders = Array()
const fetchUserFulfilled = payload => ({ type: 'PONG', payload });
function setMe(user) {
  return {
    type: 'PONG',
    payload: user
  };
}

const pingEpic = action$ => {
  console.log(action$)
  console.log(orders)
  return action$.ofType(PING)
    .map(action => action.payload)
    .bufferTime(4000)
    .map(setMe)
    
  // .mapTo(value => value)
    // .mapTo({ type: 'PONG' });
}
export default pingEpic