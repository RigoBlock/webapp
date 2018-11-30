import { formatCoins } from './../format'
import { getBlockChunks } from './blockChunks'
import { getTransactionsSingleVault } from './getTransactionsSingleVault'
import { logToEvent } from './logToEvent'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3Wrapper from '../../_utils/web3Wrapper/src'
import moment from 'moment'

export const getTransactionsVaultOptV2 = async (
  api,
  poolAddress,
  accounts = [],
  options = {
    balance: true,
    supply: false,
    limit: 20,
    trader: true,
    drago: false
  }
) => {
  if (poolAddress)
    return getTransactionsSingleVault(poolAddress, api, accounts, options)
  let startTime = new Date()
  if (accounts.length === 0) {
    return [Array(0), Array(0), Array(0)]
  }
  let web3 = Web3Wrapper.getInstance(api._rb.network.id)
  web3._rb = window.web3._rb
  const poolApi = new PoolApi(web3)
  let dragoSymbolRegistry = new Map()
  let fromBlock
  switch (api._rb.network.id) {
    case 1:
      fromBlock = '6000000'
      break
    case 42:
      fromBlock = '7000000'
      break
    case 3:
      fromBlock = '3000000'
      break
    default:
      fromBlock = '3000000'
  }

  console.log(
    `***** ${moment().format()} Utils: ${
      options.drago ? 'DRAGO' : 'VAULT'
    } events fetching started *****`
  )

  const logToEventInternal = log => {
    return logToEvent(log, dragoSymbolRegistry, api)
  }

  // Getting all buyDrago and selDrago events since block 0.
  // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
  // to be passed to getAllLogs. Events are indexed and filtered by topics
  // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

  // The second param of the topics array is the drago address
  // The third param of the topics array is the from address
  // The third param of the topics array is the to address
  //
  //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

  let hexAccounts = null
  let hexPoolAddress = null
  if (poolAddress)
    hexPoolAddress = ['0x' + poolAddress.substr(2).padStart(64, '0')]
  // Formatting accounts address
  if (accounts !== null) {
    hexAccounts = accounts.map(account => {
      const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
      return hexAccount
    })
  }

  const getPoolsFromOwner = async () => {
    let arrayPromises = accounts.map(async account => {
      await poolApi.contract.vaultfactory.init()
      const poolsList = await poolApi.contract.vaultfactory
        .getVaultsByAddress(account.address)
        .then(results => {
          return results
        })
        .catch(error => {
          console.warn(error)
          throw error
        })
      poolsList.forEach(v => {
        const dragoData = {
          symbol: null,
          vaultId: null,
          name: null,
          address: v
        }
        if (!dragoSymbolRegistry.has(v)) {
          dragoSymbolRegistry.set(v, dragoData)
        }
      })
      return poolsList
    })
    return Promise.all(arrayPromises)
  }

  if (options.trader) {
  } else {
    await getPoolsFromOwner()
  }

  // Initializing the eventful contract
  return poolApi.contract.dragoregistry.init().then(() => {
    return poolApi.contract.vaulteventful.init().then(() => {
      const getChunkedEvents = topics => {
        let arrayPromises = []
        return web3.eth.getBlockNumber().then(async lastBlock => {
          let chunck = 100000
          lastBlock = new BigNumber(lastBlock).toNumber()
          const chunks = await getBlockChunks(fromBlock, lastBlock, chunck)
          arrayPromises = chunks.map(async chunk => {
            // Pushing chunk logs into array
            let options = {
              topics: topics,
              fromBlock: chunk.fromBlock,
              toBlock: chunk.toBlock
            }
            return await poolApi.contract.vaulteventful.getAllLogs(options)
          })

          return Promise.all(arrayPromises).then(results => {
            if (options.trader) {
            } else {
            }
            let dragoTransactionsLog = [].concat(...results)
            const logs = dragoTransactionsLog.map(logToEventInternal)
            return logs
          })
        })
      }

      let eventSig
      eventSig = options.drago
        ? [
            poolApi.contract.vaulteventful.hexSignature.BuyDrago,
            poolApi.contract.vaulteventful.hexSignature.SellDrago
          ]
        : [
            poolApi.contract.vaulteventful.hexSignature.BuyVault,
            poolApi.contract.vaulteventful.hexSignature.SellVault
          ]

      let topicsBuySell = [eventSig, hexPoolAddress, hexAccounts, null]

      eventSig = options.drago
        ? [poolApi.contract.vaulteventful.hexSignature.DragoCreated]
        : [poolApi.contract.vaulteventful.hexSignature.VaultCreated]

      let topicsCreate = [eventSig, hexPoolAddress, null, hexAccounts]

      let promisesEvents = null

      options.trader
        ? (promisesEvents = [getChunkedEvents(topicsBuySell)])
        : (promisesEvents = [getChunkedEvents(topicsCreate)])

      return Promise.all(promisesEvents)
        .then(results => {
          let allLogs = [...results[0]]
          // Creating an array of promises that will be executed to add timestamp and symbol to each entry
          // Doing so because for each entry we need to make an async call to the client
          // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
          // console.log(results)

          function compare(a, b) {
            // Use toUpperCase() to ignore character casing
            const bloclNumberA = a.blockNumber
            const bloclNumberB = b.blockNumber

            let comparison = 0
            if (bloclNumberA.gt(bloclNumberB)) {
              comparison = 1
            } else if (bloclNumberA.lt(bloclNumberB)) {
              comparison = -1
            }
            return comparison
          }
          let supply = []
          let balances = []
          let balancesList = []
          allLogs.sort(compare)
          let dragoTransactionsLogs = allLogs.slice(
            allLogs.length - 20,
            allLogs.length
          )

          // This is an inefficient way to get the symbol for each transactions.
          // In the future the symbol will have to be saved in the eventful logs.
          const getDragoDetails = () => {
            let arrayPromises = []
            dragoSymbolRegistry.forEach((v, k) => {
              arrayPromises.push(
                poolApi.contract.dragoregistry
                  .fromAddress(k)
                  .then(dragoDetails => {
                    const dragoData = {
                      symbol: dragoDetails[2].trim(),
                      vaultId: new BigNumber(dragoDetails[3]).toFixed(),
                      name: dragoDetails[1].trim(),
                      address: k.trim()
                    }
                    dragoSymbolRegistry.set(k, dragoData)
                    return dragoDetails
                  })
                  .catch(error => {
                    console.warn(error)
                    throw error
                  })
              )
            })
            return arrayPromises
          }

          // Getting dragos supply
          const getDragoSupply = () => {
            let arrayPromises = []
            if (options.supply === false) {
              supply = []
              return arrayPromises
            }
            dragoSymbolRegistry.forEach((v, k) => {
              poolApi.contract.vault.init(k)
              arrayPromises.push(
                poolApi.contract.vault
                  .totalSupply()
                  .then(dragoSupply => {
                    const {
                      symbol,
                      name,
                      vaultId,
                      address
                    } = dragoSymbolRegistry.get(k)
                    supply.push({
                      supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                      name: name.trim(),
                      symbol: symbol,
                      vaultId: vaultId,
                      address: address
                    })
                  })
                  .catch(error => {
                    console.warn(error)
                    throw error
                  })
              )
            })
            return arrayPromises
          }

          // Getting dragos balances
          const getDragoBalances = () => {
            let arrayPromises = []
            // Checking if balance return is required
            if (options.balance === false) {
              balances = []
              return arrayPromises
            }
            accounts.forEach(account => {
              let accountAddress = account.address
              balances[accountAddress] = []
              dragoSymbolRegistry.forEach((v, k) => {
                poolApi.contract.vault.init(k)
                arrayPromises.push(
                  poolApi.contract.vault
                    .balanceOf(accountAddress)
                    .then(dragoBalance => {
                      const {
                        symbol,
                        name,
                        vaultId,
                        address
                      } = dragoSymbolRegistry.get(k)
                      balances[accountAddress][vaultId] = {
                        balance: new BigNumber(dragoBalance),
                        name: name.trim(),
                        symbol: symbol,
                        vaultId: vaultId,
                        address: address
                      }
                    })
                    .catch(error => {
                      console.warn(error)
                      throw error
                    })
                )
              })
            })
            return arrayPromises
          }

          const getTimestamp = logs => {
            return logs.map(log => {
              return web3.eth
                .getBlock(new BigNumber(log.blockNumber).toFixed(0))
                .then(block => {
                  log.timestamp = new Date(block.timestamp * 1000)
                  return log
                })
                .catch(() => {
                  // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                  // other issues in the app.
                  log.timestamp = new Date(0)
                  return log
                })
            })
          }

          return Promise.all(getDragoDetails()).then(() => {
            return Promise.all(getDragoSupply()).then(() => {
              return Promise.all(getDragoBalances())
                .then(() => {
                  if (options.balance) {
                    // Reorganizing the balances array
                    let balancesRegistry = new Map()
                    let tokenBalances = []
                    for (let v in balances) {
                      balances[v].forEach(balance => {
                        if (balancesRegistry.has(balance.vaultId)) {
                          let dragoBalance = balancesRegistry.get(
                            balance.vaultId
                          ).balance
                          balancesRegistry.set(balance.vaultId, {
                            symbol: balance.symbol,
                            vaultId: balance.vaultId,
                            name: balance.name,
                            address: balance.address,
                            balance: dragoBalance.plus(balance.balance)
                          })
                        } else {
                          balancesRegistry.set(balance.vaultId, {
                            symbol: balance.symbol,
                            vaultId: balance.vaultId,
                            name: balance.name,
                            address: balance.address,
                            balance: balance.balance
                          })
                        }
                      })
                    }
                    balancesRegistry.forEach((v, k) => {
                      // Filtering empty balances
                      if (balancesRegistry.get(k).balance.gt(0)) {
                        tokenBalances.push({
                          symbol: balancesRegistry.get(k).symbol,
                          name: balancesRegistry.get(k).name,
                          vaultId: balancesRegistry.get(k).vaultId,
                          address: balancesRegistry.get(k).address,
                          balance: formatCoins(
                            balancesRegistry.get(k).balance,
                            4,
                            api
                          )
                        })
                      }
                    })

                    balancesList = tokenBalances
                  }
                })
                .then(() => {
                  let logs = dragoTransactionsLogs
                  // console.log(
                  //   `***** ${moment().format()} Utils: symbols loaded *****`
                  // )
                  return Promise.all(getTimestamp(logs)).then(logs => {
                    // console.log(
                    //   `***** ${moment().format()} Utils: events timestamp fetched *****`
                    // )
                    balancesList.sort(function(a, b) {
                      if (a.symbol < b.symbol) return -1
                      if (a.symbol > b.symbol) return 1
                      return 0
                    })
                    logs.reverse()
                    supply.sort(function(a, b) {
                      if (a.symbol < b.symbol) return -1
                      if (a.symbol > b.symbol) return 1
                      return 0
                    })
                    let results = [balancesList, logs, supply]
                    return results
                  })
                })
                .catch(error => {
                  console.warn(error)
                  throw error
                })
            })
          })
        })
        .then(results => {
          let endTime = new Date()
          let dif = startTime.getTime() - endTime.getTime()
          let Seconds_from_T1_to_T2 = dif / 1000
          let Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2)
          if (options.trader) {
            console.log(
              `***** ${moment().format()} Utils: ${
                options.drago ? 'DRAGO' : 'VAULT'
              }${
                options.allEvents ? ' allEvents ' : ' '
              }Holder transactions loaded in ${Seconds_Between_Dates}s *****`
            )
          } else {
            console.log(
              `***** ${moment().format()} Utils: ${
                options.drago ? 'DRAGO' : 'VAULT'
              }${
                options.allEvents ? ' allEvents ' : ' '
              }Manager transactions loaded in ${Seconds_Between_Dates}s *****`
            )
          }
          return results
        })
    })
  })
}
