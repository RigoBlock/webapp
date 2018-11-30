// Copyright 2016-2017 Rigo Investment Sagl.

import {
  MSG_NETWORK_STATUS_ERROR,
  MSG_NO_SUPPORTED_NETWORK,
  NETWORK_WARNING
} from './const'
import BigNumber from 'bignumber.js'
import PoolsApi from '../PoolsApi/src'
import Web3Wrapper from './web3Wrapper/src/web3Wrapper'
import utils from '../_utils/utils'

class Interfaces {
  constructor(api, networkId) {
    this._api = api
    this._parityNetworkId = networkId
    this._success = {}
    this._error = {}
    this._isConnected = {}
  }

  get success() {
    return this._success
  }

  get error() {
    return this._error
  }

  isConnected = () => {
    // Checking if app is connected to node
    const api = this._api
    if (!api.isConnected) {
      // console.log(api.isConnected)
      this._error = {
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR
      }
      return false
    }
    return true
  }

  getAccountsParity() {
    console.log(`${this.constructor.name} -> getAccountsParity`)
    const api = this._api
    let accounts = {}
    let arrayPromises = []
    return (
      api.parity
        .accountsInfo()
        // .allAccountsInfo()
        .then(accountsParity => {
          // console.log(accountsParity)
          const poolsApi = new PoolsApi(this._api)
          poolsApi.contract.rigotoken.init()
          Object.keys(accountsParity).forEach(function(k) {
            // Getting accounts ETH balance
            accounts[k] = {}
            arrayPromises.push(
              api.eth
                .getBalance(k)
                .then(balance => {
                  accounts[k].ethBalance = utils.formatFromWei(balance)
                  accounts[k].ethBalanceWei = balance
                  accounts[k].name = accountsParity[k].name
                  accounts[k].source = 'parity'
                  return accounts
                })
                .catch(() => {
                  throw new Error(`Cannot get ETH balance of account ${k}`)
                })
            )
            // Getting accounts GRG balance
            arrayPromises.push(
              poolsApi.contract.rigotoken
                .balanceOf(k)
                .then(grgBalance => {
                  accounts[k].grgBalance = utils.formatFromWei(grgBalance)
                  accounts[k].grgBalanceWei = grgBalance
                  return accounts
                })
                .catch(() => {
                  throw new Error(`Cannot get GRG balance of account ${k}`)
                })
            )
            // Getting transactions count
            arrayPromises
              .push(
                api.eth.getTransactionCount(k).then(result => {
                  accounts[k].nonce = new BigNumber(result).toFixed()
                  return accounts
                })
              )
              .catch(() => {
                throw new Error(`Cannot get transactions count of account ${k}`)
              })
          })
          return Promise.all(arrayPromises).then(() => {
            console.log('Parity getAccounts', accounts)
            // const accountsData = {...results}
            // console.log(accountsData)
            return accounts
          })
        })
        .catch(error => {
          console.log('getAccounts', error)
          return {}
        })
    )
  }

  getAccountsMetamask = async () => {
    // console.log(`${this.constructor.name} -> getAccountsMetamask`)
    const web3 = window.web3
    const parityNetworkId = this._parityNetworkId
    let accountsMetaMask = {}
    if (typeof web3 === 'undefined') {
      console.warn('MetaMask not detected')
      return
    }
    try {
      // Check if MetaMask is connected to the same network as the endpoint
      let accounts = await web3.eth.getAccounts()
      let metaMaskNetworkId = await web3.eth.net.getId()
      console.log('Account MM: ', accounts, metaMaskNetworkId)
      let isMetaMaskLocked = accounts.length === 0 ? true : false
      let currentState = { ...this._success }
      if (metaMaskNetworkId !== parityNetworkId) {
        const stateUpdate = {
          isMetaMaskNetworkCorrect: false,
          isMetaMaskLocked,
          warnMsg: MSG_NO_SUPPORTED_NETWORK
        }
        this._success = {
          ...currentState,
          ...stateUpdate
        }
        return accountsMetaMask
      } else {
        // Get MetaMask accounts
        const stateUpdate = {
          isMetaMaskNetworkCorrect: true,
          warnMsg: '',
          isMetaMaskLocked
        }
        this._success = {
          ...currentState,
          ...stateUpdate
        }

        // Return empty object if MetaMask is locked.
        if (isMetaMaskLocked) {
          return {}
        }

        // Get ETH balance
        let ethBalance = new BigNumber(0)
        let grgBalance = new BigNumber(0)
        let nonce = 0

        let wrapper, poolsApi
        try {
          wrapper = Web3Wrapper.getInstance()
          poolsApi = new PoolsApi(wrapper)
          poolsApi.contract.rigotoken.init()
        } catch (err) {
          console.warn(err)
          throw new Error(`Error on Web3Wrapper.getInstance()`)
        }

        ethBalance = wrapper.eth.getBalance(accounts[0]).catch(err => {
          console.warn(err)
          // throw new Error(`Cannot get ETH balance of account ${accounts[0]}`)
        })
        grgBalance = poolsApi.contract.rigotoken
          .balanceOf(accounts[0])
          .catch(err => {
            console.warn(err)
            // throw new Error(`Cannot get GRG balance of account ${accounts[0]}`)
          })
        nonce = wrapper.eth.getTransactionCount(accounts[0]).catch(err => {
          console.warn(err)
          // throw new Error(
          //   `Cannot get transactions count of account ${accounts[0]}`
          // )
        })

        try {
          ethBalance = await ethBalance
        } catch (err) {
          console.warn(err)
          throw new Error(`Cannot get ETH balance of account ${accounts[0]}`)
        }
        try {
          grgBalance = await grgBalance
        } catch (err) {
          console.warn(err)
          throw new Error(`Cannot get GRG balance of account ${accounts[0]}`)
        }
        try {
          nonce = await nonce
        } catch (err) {
          console.warn(err)
          throw new Error(
            `Cannot get transactions count of account ${accounts[0]}`
          )
        }

        let accountsMetaMask = {
          [accounts[0]]: {
            ethBalance: new BigNumber(web3.utils.fromWei(ethBalance)).toFixed(
              3
            ),
            ethBalanceWei: ethBalance,
            grgBalance: new BigNumber(web3.utils.fromWei(grgBalance)).toFixed(
              3
            ),
            grgBalanceWei: grgBalance,
            name: 'MetaMask',
            source: 'MetaMask',
            nonce: nonce
          }
        }
        return accountsMetaMask
      }
    } catch (error) {
      console.warn(error)
      // return {}
      throw new Error(`getAccountsMetamask`)
    }
  }

  attachInterfaceInfuraV2 = async () => {
    console.log(`${this.constructor.name} -> Interface Infura`)
    const api = this._api
    try {
      let accountsMetaMask
      try {
        accountsMetaMask = await this.getAccountsMetamask(api)
      } catch (e) {
        console.warn(e)
        throw new Error(`attachInterfaceInfuraV2`)
      }
      const allAccounts = {
        ...accountsMetaMask
      }
      // let blockNumber = 0
      // try {
      //   blockNumber = await api.eth.getBlockNumber()
      // } catch (error) {
      //   console.warn(error)
      // }
      console.log(
        'Metamask account loaded: ',
        accountsMetaMask
        // new BigNumber(blockNumber).toFixed()
      )

      const stateUpdate = {
        loading: false,
        // prevBlockNumber: blockNumber.toFixed(),
        accounts: Object.keys(allAccounts).map(address => {
          const info = allAccounts[address] || {}
          return {
            address,
            name: info.name,
            source: info.source,
            ethBalance: info.ethBalance,
            ethBalanceWei: info.ethBalanceWei,
            grgBalance: info.grgBalance,
            grgBalanceWei: info.grgBalanceWei,
            nonce: info.nonce
          }
        })
      }
      const result = {
        ...this._success,
        ...stateUpdate
      }
      // this._success = result
      console.log(`${this.constructor.name} -> Done`)
      return result
    } catch (error) {
      let currentState = this._error
      const stateUpdate = {
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR
      }
      this._error = {
        ...currentState,
        ...stateUpdate
      }
      console.warn(`${this.constructor.name} -> Error`, error)
      throw this._error
    }
  }

  attachInterfaceRigoBlockV2 = async () => {
    console.log(`${this.constructor.name} -> Interface RigoBlock`)
    const api = this._api
    let accountsParity = {}
    let accountsMetaMask = {}
    try {
      // Check if the parity node is running in --public-mode
      let nodeKind = await api.parity.nodeKind()
      if (nodeKind.availability === 'public') {
        // if Parity in --public-node then getting only MetaMask accounts
        try {
          accountsMetaMask = await this.getAccountsMetamask()
        } catch (err) {
          console.warn(err)
          throw new Error(`Error ongetAccountsMetamask()`)
        }
      } else {
        // if Parity NOT in --public-node then getting both Parity and MetaMask accounts
        accountsMetaMask = await this.getAccountsMetamask()
        accountsParity = await this.getAccountsParity()
      }
      const blockNumber = await api.eth.getBlockNumber()
      const allAccounts = {
        ...accountsParity,
        ...accountsMetaMask
      }
      const stateUpdate = {
        loading: false,
        prevBlockNumber: new BigNumber(blockNumber).toFixed(),
        ethBalance: new BigNumber(0),
        accounts:
          Object.keys(allAccounts).length !== 0
            ? Object.keys(allAccounts).map(address => {
                const info = allAccounts[address] || {}
                return {
                  address,
                  name: info.name,
                  source: info.source,
                  ethBalance: info.ethBalance,
                  ethBalanceWei: info.ethBalanceWei,
                  grgBalance: info.grgBalance,
                  grgBalanceWei: info.grgBalanceWei,
                  nonce: info.nonce
                }
              })
            : []
      }
      const result = {
        ...this._success,
        ...stateUpdate
      }
      this._success = result
      return result
    } catch (error) {
      let currentState = this._error
      const stateUpdate = {
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR
      }
      this._error = {
        ...currentState,
        ...stateUpdate
      }
      console.log('Error attachInterfaceRigoBlock', error)
      throw new Error(this._error)
    }
  }

  detachInterface = (api, subscriptionData) => {
    // if (typeof subscriptionData === 'object') {
    //   console.log(subscriptionData)
    //   try {
    //     subscriptionData.unsubscribe(function(error, success) {
    //       if (success) {
    //         console.log(`Successfully unsubscribed from eth_blockNumber.`)
    //       }
    //       if (error) {
    //         console.log(`Unsubscribe error ${error}.`)
    //       }
    //     })
    //   } catch (error) {
    //     console.log(error)
    //   }
    // } else {
    //   try {
    //     api
    //       .unsubscribe(subscriptionData)
    //       .then(() => {
    //         console.log(
    //           `Successfully unsubscribed from eth_blockNumber -> Subscription ID: ${subscriptionData}.`
    //         )
    //       })
    //       .catch(error => {
    //         console.log(`Unsubscribe error ${error}.`)
    //       })
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }
  }
}

export { Interfaces }
