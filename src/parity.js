// Copyright 2016-2017 Gabriele Rigo

//const { api } = window.parity;

// API reference: https://gitlab.parity.io/parity/parity/blob/d2394d3ac30b589f92676eec401c50d6b388f911/js/npm/parity/README.md
// Converted rpc calls to use provider

// import { Api } from '@parity/parity.js';


// For refenences:
// https://github.com/paritytech/js-api


import Api from '@parity/api';

var HttpsUrl = true;
var WsSecureUrl = true;
const OverHttps = true;
const timeout = 1000; // to set the delay between each ping to the Http server. Default = 1000 (1 sec)


if (typeof window.parity !== 'undefined') {
  // Change to 'http://localhost:8545' and 'ws://localhost:8546' before building
  // For RPC over Https
  // HttpsUrl = 'https://srv03.endpoint.network:8545';
  HttpsUrl = 'http://localhost:8545';
  // For RPC over Websocket
  // WsSecureUrl = 'wss://srv03.endpoint.network:8546';
  WsSecureUrl = 'ws://localhost:8546';
  console.log(HttpsUrl);
} else {
  // For RPC over Https
  HttpsUrl = 'https://srv03.endpoint.network:8545';
  // For RPC over Websocket
  WsSecureUrl = 'wss://srv03.endpoint.network:8546';
}

const CheckTransport = () => {
  if (OverHttps) {
    try {
      const transport = new Api.Provider.Http(HttpsUrl, timeout);
      console.log("Connecting to ", HttpsUrl);
      return new Api(transport);
    } catch (err) {
      console.warn('Connection error: ', err);
    }
  } else {
    try {
      console.log("Connecting to ", WsSecureUrl);
      const transport = new Api.Provider.WsSecure(WsSecureUrl);
      return new Api(transport);
  } catch (err) {
      console.warn('Connection error: ', err);
  }
  }
}

var api = CheckTransport();
console.log(api);
console.log(api.isConnected);

export {
  api
};

//const ethereumProvider = window.ethereum || window.parent.ethereum;

//if (!ethereumProvider) {
//  throw new Error('Unable to locate EthereumProvider, object not attached');
  //const api = new Api('https://kovan.infura.io/oTRuD7vcUjsqn1pFIyMS');
//}

//const api = new Api(ethereumProvider);

/*
import { Web3Provider } from 'react-web3';

// ...

// Ensure that <App /> doesn't render until we confirm web3 is available
ReactDOM.render(rootEl,
  <Web3Provider>
    <App />
  </Web3Provider>
);


//import { Api } from '@parity/parity.js';
import { Api } from '@parity/parity.js';

// do the setup
const { transport } = new Api.Transport.Http('http://localhost:8545');
const { api } = new Api(transport);

export {
  api
};
*/

/*
import Api from '@parity/api';

const ethereumProvider = window.ethereum || window.parent.ethereum;

if (!ethereumProvider) {
  throw new Error('Unable to locate EthereumProvider, object not attached');
}

const api = new Api(ethereumProvider);

export {
  api
};
*/

/*
const Parity = require('@parity/parity.js');

function injectedTransport() {
	if (window && window.parity && window.parity.api.transport._url) {
		return new Parity.Api.Transport.Http(
			window.parity.api.transport._url[0] === '/'
				? window.location.protocol + '//' + window.location.host + window.parity.api.transport._url
			: window.parity.api.transport._url.contains('://')
				? window.parity.api.transport._url
				: window.location.href + window.parity.api.transport._url
		);
	}
	return null;
}
*/
