// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi'
import { RIGOTOKEN_ADDRESSES } from '../../utils/const'
import { bigNumberify } from 'ethers/utils/bignumber'
import { hexlify } from 'ethers/utils/bytes'
import BigNumber from 'bignumber.js'
import Registry from '../registry'

class RigoTokenWeb3 {
  constructor(api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.rigotoken
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
  }

  get instance() {
    if (typeof this._instance === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._instance
  }

  init = async () => {
    const api = this._api
    const abi = this._abi
    const networkId = await api.eth.net.getId()
    const address = RIGOTOKEN_ADDRESSES[networkId]
    this._instance = new api.eth.Contract(abi)
    this._instance.options.address = address
    return this._instance
  }

  balanceOf = accountAddress => {
    if (!accountAddress) {
      throw new Error('accountAddress needs to be provided')
    }
    const instance = this._instance
    return instance.methods.balanceOf(accountAddress).call({})
  }

  transfer = (fromAddress, toAddress, amount) => {
    if (!toAddress) {
      throw new Error('toAddress needs to be provided')
    }
    if (!amount) {
      throw new Error('amount needs to be provided')
    }
    const instance = this._instance
    const options = {
      from: fromAddress
    }

    if (BigNumber.isBigNumber(amount)) {
      amount = '0x' + new BigNumber(amount).toString(16)
    }
    amount = hexlify(bigNumberify(amount))
    return instance.methods
      .transfer(toAddress, amount)
      .estimateGas(options)
      .then(gasEstimate => {
        options.gas = gasEstimate
      })
      .then(() => {
        return instance.methods.transfer(toAddress, amount).send(options)
      })
  }
}

export default RigoTokenWeb3
