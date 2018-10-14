// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import { INFURA, KOVAN, PROD, WS } from '../_utils/const'
import Api from '@parity/api'
import Web3 from 'web3'

class Endpoint {
  constructor(
    endpointInfo,
    networkInfo = { name: KOVAN },
    prod = PROD,
    ws = WS
  ) {
    if (!endpointInfo) {
      throw new Error(
        'endpointInfo connection data needs to be provided to Endpoint'
      )
    }
    if (!networkInfo) {
      throw new Error('network name needs to be provided to Endpoint')
    }
    this._timeout = 10000
    this._endpoint = endpointInfo
    this._network = networkInfo
    this._prod = prod
    // Infura does not support WebSocket on Kovan network yet. Disabling.
    this._onWs =
      this._network.name === KOVAN && this._endpoint.name === INFURA
        ? false
        : ws
    // Setting production or development endpoints
    if (prod) {
      this._https = endpointInfo.https[this._network.name].prod
      this._wss = endpointInfo.wss[this._network.name].prod
    } else {
      this._https = endpointInfo.https[this._network.name].dev
      this._wss = endpointInfo.wss[this._network.name].dev
    }
  }

  get timeout() {
    return this._timeout
  }

  set timeout(timeout) {
    this._timeout = timeout
  }

  connect() {
    if (this._onWs) {
      try {
        console.log('Network: ', this._network.name)
        console.log('Connecting to WebSocket: ', this._wss)
        const transport = new Api.Provider.WsSecure(this._wss)
        api = new Api(transport)
        api._rb = {}
        api._rb.network = this._network
        console.log(api)
        return api
      } catch (error) {
        console.log('Connection error: ', error)
        return error
      }
    } else {
      try {
        console.log('Network: ', this._network.name)
        console.log('Connecting to HTTPS: ', this._https)
        const transport = new Api.Provider.Http(this._https, this._timeout)
        api = new Api(transport)
        api._rb = {}
        api._rb.network = this._network
        console.log(api)
        return api
      } catch (error) {
        console.log('Connection error: ', error)
        return error
      }
    }
  }
}

export default Endpoint
