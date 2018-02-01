// Copyright 2016-2017 Rigo Investment Sarl.

// const { api } = window.parity;

// API reference: https://gitlab.parity.io/parity/parity/blob/d2394d3ac30b589f92676eec401c50d6b388f911/js/npm/parity/README.md
// Converted rpc calls to use provider

// import { Api } from '@parity/parity.js'


// For refenences:
// https://github.com/paritytech/js-api


import Api from '@parity/api'
import Web3 from 'web3'
import {EP_INFURA_KV, EP_RIGOBLOCK_KV} from './utils/const.js'

var HttpsUrl = '';
var WsSecureUrl = '';
const OverHttps = true;
const timeout = 1000; // to set the delay between each ping to the Http server. Default = 1000 (1 sec)
const infuraKovan = EP_INFURA_KV
const rigoBlockEnd = EP_RIGOBLOCK_KV
const endpoint = localStorage.getItem('endpoint')

console.log(endpoint)
console.log(api)
console.log(window)

if (typeof window.parity !== 'undefined') {
  // Change to 'http://localhost:8545' and 'ws://localhost:8546' before building
  // For RPC over Https
  // HttpsUrl = 'https://srv03.endpoint.network:8545';
  HttpsUrl = 'http://127.0.0.1:8545';
  // For RPC over Websocket
  // WsSecureUrl = 'wss://srv03.endpoint.network:8546';
  WsSecureUrl = 'ws://127.0.0.1:8546';
  localStorage.setItem('endpoint', 'local')
  
  console.log('Found Parity!')


} else {
  // For RPC over Https
  // HttpsUrl = rigoBlockEnd;
  // HttpsUrl = infuraKovan;
  if (endpoint !== null) {
    switch (endpoint) {
      case "infura":
        HttpsUrl = EP_INFURA_KV
      break;
      case "rigoblock":
        HttpsUrl = EP_RIGOBLOCK_KV
      break;
      
    }
  } else {
    localStorage.setItem('endpoint', 'rigoblock')
    HttpsUrl = rigoBlockEnd;
  }
  // For RPC over Websocket
  WsSecureUrl = 'wss://srv03.endpoint.network:8546';
}

// Checking if Web3 has been injected by the browser (Mist/MetaMask)

if (typeof window.web3 !== 'undefined') {
  // Use Mist/MetaMask's provider
  console.log('Found MetaMask!')
  window.web3 = new Web3(window.web3.currentProvider)
} else {
  console.log('No web3? You should consider trying MetaMask!')
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  // window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
}

// Now you can start your app & access web3 freely:



const checkTransport = () => {
  if (OverHttps) {
    try {
      // for @parity/api
      const transport = new Api.Provider.Http(HttpsUrl, timeout)
      
      // console.log(transport.isConnected)
      // @parity/parity.js
      // const transport = new Api.Transport.Http(HttpsUrl, timeout);
      console.log("Connecting to ", HttpsUrl)
      return new Api(transport);
    } catch (err) {
      console.warn('Connection error: ', err);
    }
  } else {
    try {
      console.log("Connecting to ", WsSecureUrl);
      // for @parity/api
      const transport = new Api.Provider.WsSecure(WsSecureUrl);
      // @parity/parity.js
      // const transport = new Api.Transport.WsSecure(WsSecureUrl);
      return new Api(transport);
  } catch (err) {
      console.warn('Connection error: ', err);
  }
  }
}

var api = checkTransport()

api.isConnected ? console.log('Connected to Node:', api.isConnected) : console.log('Could not connect to node.')


export {
  api
};


