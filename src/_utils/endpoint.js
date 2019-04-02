// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import { ENDPOINTS, KOVAN, PROD, WS } from './const'
import Web3 from 'web3'
import Web3Wrapper from '../_utils/web3Wrapper/src'

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
    this._onWs = ws
    /*
    this._onWs =
      this._network.name === KOVAN && this._endpoint.name === INFURA
        ? false
        : ws
    */
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

  _checkLocal = () => {
    if (typeof window.parity !== 'undefined') {

      return true
    }
    return false
  }

  _checkWeb3 = async () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.ethereum !== 'undefined') {
      window.web3 = new Web3(window.ethereum)
      try {
        // Request account access if needed
        await window.ethereum.enable()
        console.warn('User allowed account access')
      } catch (error) {
        console.warn('User denied account access')
      }
    } else
    if (typeof window.web3 !== 'undefined') {
      try {
        window.web3 = new Web3(window.web3.currentProvider)
      } catch (error) {

      }
      window.web3._rb = {}
      window.web3._rb.network = this._network
      window.web3._rb.wss = ENDPOINTS.infura.wss[this._network.name].dev
    } else {

    }
  }

  connect = () => {
    this._checkWeb3()
    let web3Wrapper
    try {
      web3Wrapper = Web3Wrapper.getInstance(
        this._network.id,
        this._endpoint.name
      )
    } catch (error) {
      console.warn(error)
    }

    let api
    if (this._checkLocal()) {

      window.parity.api._rb = {}
      window.parity.api._rb.network = this._network
      return window.parity.api
    }

    try {
      api = web3Wrapper
      api._rb = {}
      api._rb.network = this._network
      api._rb.network.transportWs = this._wss
      api._rb.network.transportHttp = this._https



      return api
    } catch (error) {

      return error
    }

    // if (this._onWs) {
    //   try {
    //     console.log('Network: ', this._network.name)
    //     console.log('Connecting to WebSocket: ', this._wss)
    //     const transport = new Api.Provider.WsSecure(this._wss)
    //     api = new Web3(window.web3.currentProvider)
    //     api._rb = {}
    //     api._rb.network = this._network
    //     api._rb.network.transportWs = this._wss
    //     console.log(api)
    //     return api
    //   } catch (error) {
    //     console.log('Connection error: ', error)
    //     return error
    //   }
    // } else {
    //   try {
    //     console.log('Network: ', this._network.name)
    //     console.log('Connecting to HTTPS: ', this._https)
    //     const transport = new Api.Provider.Http(this._https, this._timeout)
    //     api = new Web3(window.web3.currentProvider)
    //     api._rb = {}
    //     api._rb.network = this._network
    //     api._rb.network.transportWs = this._wss
    //     console.log(api)
    //     return api
    //   } catch (error) {
    //     console.log('Connection error: ', error)
    //     return error
    //   }
    // }
  }
}

export default Endpoint
