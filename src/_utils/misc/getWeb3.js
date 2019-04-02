import { HTTP_EVENT_FETCHING, METAMASK } from '../const'
import Web3 from 'web3'
import Web3Wrapper from '../web3Wrapper/src'

export const getWeb3 = (networkInfo, options = { wallet: '' }) => {
  if (networkInfo.id === 5777) {
    return new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }
  let web3

  switch (options.wallet) {
    case METAMASK: {
      if (typeof window !== 'undefined') {
        //web3 = window.web3
        web3 = new Web3(window.ethereum)
      } else {
        web3 = 'Test env'
      }
      break
    }
    default: {
      web3 = Web3Wrapper.getInstance(networkInfo.id)
      if (HTTP_EVENT_FETCHING) {
        web3 = new Web3(web3._rb.network.transportHttp)
      } else {
        web3 = Web3Wrapper.getInstance(networkInfo.id)
      }
    }
  }
  return web3
}
// TODO: review web3 injection
