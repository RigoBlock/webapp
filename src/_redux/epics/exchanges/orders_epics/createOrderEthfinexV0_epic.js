import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions/'
import { Observable, of } from 'rxjs'
import { /*signatureUtils,*/ generatePseudoRandomSalt } from '0x.js'
import { map, mergeMap, tap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import {
    assetDataUtils,
    BigNumber
} from '0x.js'
import Web3 from 'web3'
import moment from 'moment'

import utils from '../../../../_utils/utils'

const newMakerOrderV0 = (orderSide, options, state$) => {
  const adjustExpirationTime = lockExpirationTime => {
    return moment
      .unix(lockExpirationTime)
      .subtract(10, 'm')
      .unix()
  }
  let makerTokenAddress, takerTokenAddress, orderExpirationTime
  const {
    selectedTokensPair,
    selectedExchange,
    selectedFund,
    selectedRelay
  } = state$.value.exchange
  if (selectedRelay.isTokenWrapper) {
    makerTokenAddress =
      orderSide === 'asks'
        ? selectedTokensPair.baseToken.wrappers[selectedExchange.name].address
        : selectedTokensPair.quoteToken.wrappers[selectedExchange.name].address
    takerTokenAddress =
      orderSide === 'asks'
        ? selectedTokensPair.quoteToken.wrappers[selectedExchange.name].address
        : selectedTokensPair.baseToken.wrappers[selectedExchange.name].address
    orderExpirationTime =
      orderSide === 'asks'
        ? adjustExpirationTime(selectedTokensPair.baseTokenLockWrapExpire)
        : adjustExpirationTime(selectedTokensPair.quoteTokenLockWrapExpire)
  } else {
    makerTokenAddress =
      orderSide === 'asks'
        ? selectedTokensPair.baseToken.address
        : selectedTokensPair.quoteToken.address
    takerTokenAddress =
      orderSide === 'asks'
        ? selectedTokensPair.quoteToken.address
        : selectedTokensPair.baseToken.address
    orderExpirationTime = moment()
      .add(24, 'h')
      .unix()
  }

  const web3 = new Web3()

/*
  const ERC20_METHOD_ABI = {
    constant: false,
    inputs: [
        {
            name: 'tokenContract',
            type: 'address',
        },
    ],
    name: 'ERC20Token',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  }

  const encodedMakerToken = web3.eth.abi.encodeFunctionCall(
    ERC20_METHOD_ABI,
    [makerTokenAddress.toLowerCase()]
  )

  const encodedTakerToken = web3.eth.abi.encodeFunctionCall(
    ERC20_METHOD_ABI,
    [takerTokenAddress.toLowerCase()]
  )
*/

  const order = {
    // TODO: check inputs, exchange is 0xV2, relayer is hot wallet
    makerAddress: selectedFund.details.address.toLowerCase(),
    takerAddress: '0x0000000000000000000000000000000000000000',

    feeRecipientAddress: selectedExchange.feeRecipient.toLowerCase(),
    senderAddress: selectedExchange.feeRecipient.toLowerCase(), // hot wallet

    makerAssetAmount: web3.utils.toBN('0'), // we try without defining the amounts first
    takerAssetAmount: web3.utils.toBN('0'), // we try without defining the amounts first

    makerFee: new BigNumber(0).toString(),
    takerFee: new BigNumber(0).toString(),

    expirationTimeSeconds: orderExpirationTime.toString(),

    salt: generatePseudoRandomSalt().toString(),

    makerAssetData: assetDataUtils.encodeERC20AssetData(makerTokenAddress.toLowerCase()),
    takerAssetData: assetDataUtils.encodeERC20AssetData(takerTokenAddress.toLowerCase()),

    exchangeAddress: selectedExchange.exchangeAddress.toLowerCase()
  }

  const makerOrder = {
    details: {
      order: order,
      orderAmount: 0,
      orderPrice: 0,
      orderType: orderSide
    },
    orderAmountError: true,
    orderPriceError: true,
    orderFillAmount: '0',
    orderMaxAmount: '0',
    orderPrice: '0',
    orderType: orderSide,
    takerOrder: false,
    selectedTokensPair: selectedTokensPair
  }
  return makerOrder
}

const createOrderEthfinexV0Epic = (action$, state$) => {
  return action$.pipe(
    ofType(utils.customRelayAction(TYPE_.ORDER_CREATE)),
    mergeMap(action => {
      const { orderSide, options } = action.payload
      return Observable.concat(
        of(newMakerOrderV0(orderSide, options, state$))
      ).pipe(
        map(order => {
          return Actions.exchange.updateOrder(order)
        }),
        tap(val => {
          return val
        })
      )
    })
  )
}

export default createOrderEthfinexV0Epic
