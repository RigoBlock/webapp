// import * as abis from '../PoolsApi/src/contracts/abi'
import { APP, DS } from './const'
import { DRG_ISIN } from './const'
import { ERCdEX, Ethfinex } from './const'
import { MOCK_ERC20_TOKENS } from './tokens'
import {
  MSG_NETWORK_STATUS_ERROR,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  NETWORK_WARNING
} from './const'
import {
  dateFromTimeStampHuman,
  getBlockChunks,
  getDragoDetails,
  getDragoLiquidityAndTokenBalances,
  getTokenWrapperLockTime,
  getTransactionsDragoOptV2,
  getTransactionsSingleDrago,
  getTransactionsSingleVault,
  getTransactionsVaultOptV2,
  getVaultDetails
} from './utils/index'
import { toBaseUnitAmount, toUnitAmount } from './format'
import BigNumber from 'bignumber.js'
import ElementNotification from '../Elements/elementNotification'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import PoolApi from '../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Web3 from 'web3'
import palette from './palete'

class NotificationAlert extends Component {
  static propTypes = {
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string.isRequired,
    eventType: PropTypes.string.isRequired
  }

  render(primaryText, secondaryText, eventType) {
    return (
      <MuiThemeProvider>
        <ElementNotification
          primaryText={primaryText}
          secondaryText={secondaryText}
          eventType={eventType}
          eventStatus="executed"
          txHash=""
        />
      </MuiThemeProvider>
    )
  }
}

class utilities {
  blockChunks = getBlockChunks

  sign = (toSign, account) => {
    // metamask will take care of the 3rd parameter, "password"
    if (window.web3.currentProvider.isMetaMask) {
      return window.web3.eth.personal.sign(toSign, account)
    } else {
      return window.web3.eth.sign(toSign, account)
    }
  }
  generateMockAssets = (network = 'mainnet') => {
    let mockAssets = MOCK_ERC20_TOKENS[network]
    delete mockAssets.ETH
    for (let key in mockAssets) {
      let tokenBalance = new BigNumber(Math.floor(Math.random() * 400) + 1)
      let wrapperBalance = new BigNumber(Math.floor(Math.random() * 400) + 1)
      let totalBalance = tokenBalance.plus(wrapperBalance)
      mockAssets[key].balances = {
        token: toBaseUnitAmount(tokenBalance, mockAssets[key].decimals),
        wrappers: {
          Ethfinex: toBaseUnitAmount(wrapperBalance, mockAssets[key].decimals)
        },
        total: toBaseUnitAmount(totalBalance, mockAssets[key].decimals)
      }
    }
    return mockAssets
  }

  updateAccounts = async (api, blockNumber, state$) => {
    const currentState = state$.value
    const { endpoint } = currentState
    let newEndpoint = {}
    const prevBlockNumber = endpoint.prevBlockNumber
    const prevNonce = endpoint.prevNonce
    let newBlockNumber = new BigNumber(0)
    let notifications = Array(0)
    let fetchTransactions = false
    // Checking if blockNumber is passed by Parity Api or Web3
    if (typeof blockNumber.number !== 'undefined') {
      newBlockNumber = new BigNumber(blockNumber.number)
    } else {
      newBlockNumber = blockNumber
    }
    console.log(`endpoint_epic -> Last block: ` + prevBlockNumber)
    console.log(`endpoint_epic -> New block: ` + newBlockNumber.toFixed())
    // console.log(`endpoint_epic -> Last nonce: ` + prevNonce)

    if (new BigNumber(prevBlockNumber).gte(new BigNumber(newBlockNumber))) {
      console.log(
        `endpoint_epic -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`
      )
      newEndpoint = {
        prevBlockNumber: prevBlockNumber
      }
      return [newEndpoint, notifications, fetchTransactions]
    }

    const accounts = [].concat(endpoint.accounts)
    if (accounts.length !== 0) {
      let newNonce
      try {
        newNonce = await api.eth
          .getTransactionCount(endpoint.accounts[0].address)
          .catch(err => err)
      } catch (err) {
        console.warn(`Error getTransactionCount`)
        return new Error(err)
      }

      newNonce = new BigNumber(newNonce).toFixed()
      // console.log(`endpoint_epic -> New nonce: ` + newNonce)
      try {
        const poolApi = new PoolApi(api)
        poolApi.contract.rigotoken.init()
        // Checking GRG balance
        const grgQueries = accounts.map(account => {
          // console.log(
          //   `endpoint_epic -> API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${
          //     account.address
          //   }`
          // )
          return poolApi.contract.rigotoken
            .balanceOf(account.address)
            .catch(err => {
              console.warn('Error getTransactionCount')
              return new Error(err)
            })
        })

        // Checking ETH balance
        const ethQueries = accounts.map(account => {
          // console.log(
          //   `endpoint_epic -> API call getBalance -> applicationDragoHome: Getting balance of account ${
          //     account.address
          //   }`
          // )
          return api.eth.getBalance(account.address, 'latest')
        })
        let ethBalances
        let grgBalances
        try {
          ethBalances = await Promise.all(ethQueries).catch(err => err)
          grgBalances = await Promise.all(grgQueries).catch(err => err)
        } catch (err) {
          console.warn(err)
          return new Error(err)
        }

        const prevAccounts = [].concat(endpoint.accounts)
        prevAccounts.forEach(function(account, index) {
          // Checking ETH balance
          const newEthBalance = new BigNumber(ethBalances[index])
          const prevEthBalance = new BigNumber(account.ethBalanceWei)
          // console.log(
          //   `Old balance at block ${prevBlockNumber} -> ${prevEthBalance.toFixed()}`
          // )
          // console.log(
          //   `New balance at block ${newBlockNumber} -> ${newEthBalance.toFixed()}`
          // )
          if (
            !new BigNumber(newEthBalance).eq(prevEthBalance) &&
            // prevBlockNumber !== 0 &&
            prevNonce !== 0
          ) {
            console.log(`ETH ${account.name} balance changed.`)
            fetchTransactions = true
            let secondaryText = []
            let balDifference = prevEthBalance.minus(newEthBalance)
            const balDifString = new BigNumber(
              Web3.utils.fromWei(balDifference.toString(16))
            ).toFixed(3)
            if (balDifference.gt(new BigNumber(0))) {
              console.log(
                `endpoint_epic -> You transferred ${balDifString} ETH!`
              )
              secondaryText[0] = `You transferred ${balDifString} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            } else {
              console.log(
                `endpoint_epic -> You received ${Math.abs(balDifString)} ETH!`
              )
              secondaryText[0] = `You received ${Math.abs(balDifString)} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            }
            if (endpoint.accountsBalanceError === false) {
              notifications.push({
                primaryText: account.name,
                secondaryText: secondaryText,
                eventType: 'transfer'
              })
            }
          }

          // Checking GRG balance
          const newgrgBalance = new BigNumber(grgBalances[index])
          const prevGrgBalance = new BigNumber(account.grgBalanceWei)
          // console.log(newgrgBalance, prevGrgBalance)
          if (
            !new BigNumber(newgrgBalance).eq(prevGrgBalance) &&
            // prevBlockNumber !== 0 &&
            prevNonce !== 0
          ) {
            console.log(`GRG ${account.name} balance changed.`)
            fetchTransactions = true
            let secondaryText = []
            let balDifference = prevGrgBalance.minus(newgrgBalance)
            const balDifString = new BigNumber(
              Web3.utils.fromWei(balDifference.toString(16))
            ).toFixed(3)
            if (balDifference.gt(new BigNumber(0))) {
              console.log(
                `endpoint_epic -> You transferred ${balDifString} GRG!`
              )
              secondaryText[0] = `You transferred ${balDifString} GRG!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            } else {
              console.log(
                `endpoint_epic -> You received ${Math.abs(balDifString)} GRG!`
              )
              secondaryText[0] = `You received ${Math.abs(balDifString)} GRG!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            }
            if (endpoint.accountsBalanceError === false) {
              notifications.push({
                primaryText: account.name,
                secondaryText: secondaryText,
                eventType: 'transfer'
              })
            }
          }
        })
        newEndpoint = {
          prevBlockNumber: newBlockNumber.toFixed(),
          prevNonce: newNonce,
          loading: false,
          networkError: NETWORK_OK,
          networkStatus: MSG_NETWORK_STATUS_OK,
          accountsBalanceError: false,
          grgBalance: grgBalances.reduce(
            (total, balance) => total.plus(balance),
            new BigNumber(0)
          ),
          ethBalance: ethBalances.reduce(
            (total, balance) => total.plus(balance),
            new BigNumber(0)
          ),
          accounts: [].concat(
            accounts.map((account, index) => {
              const ethBalance = ethBalances[index]
              account.ethBalance = new BigNumber(
                Web3.utils.fromWei(ethBalance)
              ).toFixed(3)
              account.ethBalanceWei = new BigNumber(ethBalance)
              const grgBalance = grgBalances[index]
              account.grgBalance = new BigNumber(
                Web3.utils.fromWei(grgBalance)
              ).toFixed(3)
              account.grgBalanceWei = new BigNumber(grgBalance)
              return account
            })
          )
        }
        return [newEndpoint, notifications, fetchTransactions]
      } catch (error) {
        console.warn(`endpoint_epic -> ${error}`)
        // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
        newEndpoint = {
          prevBlockNumber: newBlockNumber.toFixed(),
          loading: false,
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
          accountsBalanceError: true
        }
        return [newEndpoint, notifications, fetchTransactions]
      }
    } else {
      const newEndpoint = { ...endpoint }
      newEndpoint.loading = false
      newEndpoint.prevBlockNumber = newBlockNumber.toFixed()
      return [newEndpoint, notifications, fetchTransactions]
    }
  }

  // formatFromWei = amount => {
  //   const web3 = new Web3()
  //   try {
  //     return new BigNumber(web3.utils.fromWei(web3.utils.toBN(amount))).toFixed(
  //       3
  //     )
  //   } catch (err) {
  //     return new BigNumber(web3.utils.fromWei(web3.utils.toBN(amount))).toFixed(
  //       3
  //     )
  //   }
  // }

  ethfinexTickersToArray = assets => {
    let assetArray = Array(0)
    for (let token in assets) {
      if (!['ETH', 'WETH', 'USDT', 'ETHW'].includes(assets[token].symbol)) {
        assetArray.push(`t${assets[token].symbolTicker.Ethfinex}ETH`)
      }
    }
    assetArray.push(`tETHUSD`)
    return assetArray
  }

  formatToWei = number => {
    const web3 = new Web3()
    try {
      return web3.utils.toWei(number)
    } catch (err) {
      return err
    }
  }

  getTokenSymbolForRelay = (relayName, token) => {
    switch (relayName) {
      case ERCdEX:
        return token.address
      case Ethfinex:
        return token.symbolTicker[Ethfinex]
      default:
        throw new Error('Relay unknown')
    }
  }

  notificationError = (notificationEngine, notification, level = 'error') => {
    console.log(notification)
    const messageFirstLine =
      typeof notification === 'string'
        ? notification.split(/\r?\n/)
        : notification.message.split(/\r?\n/)
    notificationEngine.addNotification({
      level: level,
      title: level.toUpperCase(),
      message: messageFirstLine[0],
      position: 'br',
      autoDismiss: 10
    })
  }

  notificationAccount = (notificationEngine, message, level = 'info') => {
    let comp = new NotificationAlert([message])
    notificationEngine.addNotification({
      level: level,
      title: level,
      position: 'br',
      autoDismiss: 10,
      children: comp.render(
        message.primaryText,
        message.secondaryText,
        message.eventType
      )
    })
  }

  availableTradeTokensPair = (
    tradeTokensPairs,
    selectedRelayName,
    networkId
  ) => {
    let availableTokens = {}
    for (let baseToken in tradeTokensPairs) {
      Object.keys(tradeTokensPairs[baseToken]).forEach(key => {
        let quoteToken = tradeTokensPairs[baseToken][key]
        if (
          quoteToken.exchanges.includes(selectedRelayName) &&
          quoteToken.networks.includes(networkId)
        ) {
          if (typeof availableTokens[baseToken] === 'undefined') {
            availableTokens[baseToken] = {}
          }
          availableTokens[baseToken][key] = tradeTokensPairs[baseToken][key]
        }
      })
    }
    return availableTokens
  }

  availableRelays = (relays, networkId) => {
    let availableRelays = {}
    Object.keys(relays).forEach(key => {
      if (relays[key].supportedNetworks.includes(networkId.toString())) {
        availableRelays[key] = relays[key]
      }
    })

    return availableRelays
  }

  calculatePortfolioValue = (dragoAssetsList, assetsPrices) => {
    const totalValue = dragoAssetsList.reduce((total, asset) => {
      if (typeof assetsPrices[asset.symbol] !== 'undefined') {
        if (typeof assetsPrices[asset.symbol].priceEth !== 'undefined') {
          if (assetsPrices[asset.symbol].priceEth !== null) {
            const value = new BigNumber(
              assetsPrices[asset.symbol].priceEth
            ).times(
              toUnitAmount(new BigNumber(asset.balances.total), asset.decimals)
            )
            return total.plus(value)
          }
        } else {
          return total.plus(0)
        }
      }
      return total.plus(0)
    }, new BigNumber(0))

    return totalValue.toFixed(5)
  }

  calculatePieChartPortfolioValue = (
    dragoAssetsList,
    assetsPrices,
    dragoETHBalance
  ) => {
    let labels = Array(0)
    let data = Array(0)
    dragoAssetsList.forEach(asset => {
      if (typeof assetsPrices[asset.symbol] !== 'undefined') {
        if (typeof assetsPrices[asset.symbol].priceEth !== 'undefined') {
          const value = new BigNumber(
            assetsPrices[asset.symbol].priceEth
          ).times(
            toUnitAmount(
              new BigNumber(asset.balances.total),
              asset.decimals
            ).toFixed(5)
          )
          labels.push(asset.symbol)
          data.push(value.toFixed(5))
        }
      }
    })
    data.push(new BigNumber(dragoETHBalance).toFixed(5))
    labels.push('ETH')
    return {
      datasets: [
        {
          data,
          backgroundColor: palette('tol', data.length).map(function(hex) {
            return '#' + hex
          })
        }
      ],
      labels
    }
  }

  dateFromTimeStamp = timestamp => {
    const day = ('0' + timestamp.getDate()).slice(-2)
    const month = ('0' + (timestamp.getMonth() + 1)).slice(-2)
    function addZero(i) {
      return i < 10 ? '0' + i : i
    }
    return (
      timestamp.getFullYear() +
      '-' +
      month +
      '-' +
      day +
      ' ' +
      addZero(timestamp.getHours()) +
      ':' +
      addZero(timestamp.getMinutes()) +
      ':' +
      addZero(timestamp.getSeconds())
    )
  }

  dateFromTimeStampHuman = dateFromTimeStampHuman

  // This funcions needs to be rewritten to work async.
  updateTransactionsQueue = (api, recentTransactions) => {
    let checkTransaction = true
    // let shouldTransactionListUpdate = false
    let newRecentTransactions = new Map(recentTransactions)
    newRecentTransactions.forEach(value => {
      if (value.status === 'executed' || value.status === 'error') {
        return
      }
      // 1.1 Checking if it's a transaction belonging to a Parity account
      if (value.parityId) {
        // 1.2 Checking if the transaction has been accepted (it has got an blockNumber)
        console.log(`Checking if blockhash undefined`)
        if (typeof value.receipt !== 'undefined') {
          console.log(value.receipt.blockNumber)
          // 1.3 Checing if it has blocknumber. It it has it, then no need to proceed further.
          value.receipt.blockNumber.eq(0)
            ? (checkTransaction = true)
            : (checkTransaction = false)
        }
        if (!checkTransaction) {
          return null
        }
        console.log(`Checking request on Parity wallet`)
        api.parity
          .checkRequest(value.parityId, [])
          .then(hash => {
            if (hash) {
              value.hash = hash
              api.eth.getTransactionByHash(hash).then(receipt => {
                value.receipt = receipt
                if (receipt.blockHash) {
                  console.log('executed')
                  value.status = 'executed'
                  value.timestamp = new Date()
                  // shouldTransactionListUpdate = true
                } else {
                  console.log('pending')
                  value.status = 'pending'
                  value.timestamp = new Date()
                  // shouldTransactionListUpdate = true
                }
              })
            }
          })
          .catch(error => {
            // console.log(error)
            value.status = 'error'
            value.error = error
            value.timestamp = new Date()
            // shouldTransactionListUpdate = true
          })
      }
    })
    return newRecentTransactions
  }

  getTransactionsVaultOptV2 = getTransactionsVaultOptV2

  getTransactionsDragoOptV2 = getTransactionsDragoOptV2

  getTransactionsSingleDrago = getTransactionsSingleDrago

  getTransactionsSingleVault = getTransactionsSingleVault

  getPoolDetailsFromId = async (dragoId, api) => {
    const poolApi = new PoolApi(api)
    await poolApi.contract.dragoregistry.init()
    const dragoDetails = await poolApi.contract.dragoregistry.fromId(dragoId)
    return dragoDetails
  }

  getDragoDetails = getDragoDetails

  getVaultDetails = getVaultDetails

  getTokenWrapperLockTime = getTokenWrapperLockTime

  getDragoLiquidity = async (dragoAddress, api) => {
    const poolApi = new PoolApi(api)
    poolApi.contract.drago.init(dragoAddress)
    const dragoETHBalance = await poolApi.contract.drago.getBalance()
    // const dragoWETHBalance = await poolApi.contract.drago.getBalanceWETH()
    // const dragoZRXBalance = await poolApi.contract.drago.getBalanceZRX()
    // console.log(dragoETHBalance, dragoWETHBalance, dragoZRXBalance)
    // return [dragoETHBalance, dragoWETHBalance, dragoZRXBalance]
    return [dragoETHBalance]
  }

  getDragoLiquidityAndTokenBalances = getDragoLiquidityAndTokenBalances

  shallowEqual(objA, objB, component = '') {
    //
    if (objA === objB) {
      // console.log(`${this.constructor.name} -> objA === objB -> ${component}`)
      return true
    }

    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      // console.log(`${this.constructor.name} -> objA !== 'object' -> ${component}`)
      return false
    }

    let keysA = Object.keys(objA)
    let keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
      // console.log(`${this.constructor.name} -> keysA.length  -> ${component}`)
      return false
    }

    // Test for A's keys different from B.
    let bHasOwnProperty = hasOwnProperty.bind(objB)
    for (let i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        // console.log(objA[keysA[i]], objB[keysA[i]])
        // console.log(
        //   `${this.constructor.name} -> Test for A's keys different from B  -> ${component}`
        // )
        return false
      }
    }
    return true
  }

  pathExplode(path) {
    let explodedPath = path.pathname.split('/')
    return explodedPath
  }

  rootPath(location) {
    let path = location.split('/')
    // path.splice(-1,1);
    // var url = path.join('/');
    return DS + APP + DS + path[2]
  }

  pathLast(path) {
    return path.pathname.split('/').pop()
  }

  customRelayAction = action => {
    // console.log(`${Ethfinex.toUpperCase()}_${action}`)
    return `${Ethfinex.toUpperCase()}_${action}`
  }

  dragoISIN(symbol, dragoId) {
    return DRG_ISIN + dragoId.toString().padStart(7, '0') + symbol.toUpperCase()
  }

  logger = (function() {
    let pub = {}

    pub.enable = function enableLogger() {
      if (this.oldConsoleLog == null) return

      window['console']['log'] = this.oldConsoleLog
    }

    pub.disable = function disableLogger() {
      this.oldConsoleLog = console.log
      window['console']['log'] = function() {}
    }

    return pub
  })()
}

const utils = new utilities()

export default utils
