import { formatCoins } from './../format'
import { getBlockChunks } from '../blockChain/getBlockChunks'
import { getTransactionsSingleDrago } from './getTransactionsSingleDrago'
import { logToEvent } from '../blockChain/logToEvent'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import { getFromBlock, getWeb3 } from '../../_utils/misc'
import moment from 'moment'

/**
 * Get the event logs from a the Drago registry
 * @param  {object} api - The Parity Api
 * @param  {sting} dragoAddress - The drago contract address
 * @param  {array} accounts - The ethereum accounts to filter
 * @param  {object} options - Set the information to return
 * @returns {promise} Promise object represents returning array of balances and transactions
 *
 *
 * This function returns an array of arrays: balances, list of transacions and supply.
 * The parameter options set the arrays to be populated
 * The functions always returns all the arrays. Setting the options will
 * make the function to return an empty array
 *
 * This function can be a performance hit, so it will need to be optimized as much as possible.
 **/
export const getTransactionsDragoOptV2 = async (
  networkInfo,
  poolAddress,
  accounts = [],
  options = {
    balance: true,
    supply: false,
    limit: 20,
    trader: true,
    drago: true
  }
) => {
  if (poolAddress)
    return getTransactionsSingleDrago(
      poolAddress,
      networkInfo,
      accounts,
      options
    )
  let startTime = new Date()
  if (accounts.length === 0) {
    return [Array(0), Array(0), Array(0)]
  }

  const web3 = getWeb3(networkInfo)
  const fromBlock = getFromBlock(networkInfo)

  const poolApi = new PoolApi(web3)
  let dragoSymbolRegistry = new Map()

  console.log(
    `***** ${moment().format()} Utils: ${
      options.drago ? 'DRAGO' : 'VAULT'
    } events fetching started *****`
  )

  const logToEventInternal = log => {
    return logToEvent(log, dragoSymbolRegistry)
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
      await poolApi.contract.dragofactory.init()
      const poolsList = await poolApi.contract.dragofactory
        .getDragosByAddress(account.address)
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
          dragoId: null,
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
    return poolApi.contract.dragoeventful.init().then(() => {
      const getChunkedEvents = topics => {
        let arrayPromises = []
        return web3.eth.getBlockNumber().then(async lastBlock => {
          let chunck = 250000
          lastBlock = new BigNumber(lastBlock).toNumber()
          const chunks = await getBlockChunks(fromBlock, lastBlock, chunck)
          arrayPromises = chunks.map(async chunk => {
            // Pushing chunk logs into array
            let options = {
              topics: topics,
              fromBlock: chunk.fromBlock,
              toBlock: chunk.toBlock
            }
            return await poolApi.contract.dragoeventful.getAllLogs(options)
          })

          return Promise.all(arrayPromises).then(results => {
            let dragoTransactionsLog = [].concat(...results)
            const logs = dragoTransactionsLog.map(logToEventInternal)
            return logs
          })
        })
      }
      let eventSig
      eventSig = options.drago
        ? [
            poolApi.contract.dragoeventful.hexSignature.BuyDrago,
            poolApi.contract.dragoeventful.hexSignature.SellDrago
          ]
        : [
            poolApi.contract.vaulteventful.hexSignature.BuyVault,
            poolApi.contract.vaulteventful.hexSignature.SellVault
          ]

      let topicsBuySell = [eventSig, hexPoolAddress, hexAccounts, null]

      eventSig = options.drago
        ? [poolApi.contract.dragoeventful.hexSignature.DragoCreated]
        : [poolApi.contract.vaulteventful.hexSignature.VaultCreated]

      let topicsCreate = [eventSig, null, null, hexAccounts]

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
            const blocklNumberA = a.blockNumber
            const blocklNumberB = b.blockNumber

            let comparison = 0
            if (blocklNumberA.gt(blocklNumberB)) {
              comparison = 1
            } else if (blocklNumberA.lt(blocklNumberB)) {
              comparison = -1
            }
            return comparison
          }

          let supply = []
          let balances = []
          let balancesList = []
          allLogs.sort(compare)
          let dragoTransactionsLogs = allLogs.slice(
            allLogs.length - options.limit,
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
                      dragoId: new BigNumber(dragoDetails[3]).toFixed(),
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

          const getDragoSupply = () => {
            let arrayPromises = []
            if (options.supply === false) {
              supply = []
              return arrayPromises
            }
            // let poolApi = new PoolApi(window.web3)
            dragoSymbolRegistry.forEach((v, k) => {
              poolApi.contract.drago.init(k)
              arrayPromises.push(
                poolApi.contract.drago
                  .totalSupply()
                  .then(dragoSupply => {
                    const {
                      symbol,
                      name,
                      dragoId,
                      address
                    } = dragoSymbolRegistry.get(k)
                    supply.push({
                      supply: formatCoins(new BigNumber(dragoSupply), 4),
                      name: name.trim(),
                      symbol: symbol,
                      dragoId: dragoId,
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
            // let poolApi = new PoolApi(window.web3)
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
                poolApi.contract.drago.init(k)
                arrayPromises.push(
                  poolApi.contract.drago
                    .balanceOf(accountAddress)
                    .then(dragoBalance => {
                      const {
                        symbol,
                        name,
                        dragoId,
                        address
                      } = dragoSymbolRegistry.get(k)
                      balances[accountAddress][dragoId] = {
                        balance: new BigNumber(dragoBalance),
                        name: name.trim(),
                        symbol: symbol,
                        dragoId: dragoId,
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
                      balances[v].map(balance => {
                        if (balancesRegistry.has(balance.dragoId)) {
                          let dragoBalance = balancesRegistry.get(
                            balance.dragoId
                          ).balance
                          balancesRegistry.set(balance.dragoId, {
                            symbol: balance.symbol,
                            dragoId: balance.dragoId,
                            name: balance.name,
                            address: balance.address,
                            balance: dragoBalance.plus(balance.balance)
                          })
                        } else {
                          balancesRegistry.set(balance.dragoId, {
                            symbol: balance.symbol,
                            dragoId: balance.dragoId,
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
                          dragoId: balancesRegistry.get(k).dragoId,
                          address: balancesRegistry.get(k).address,
                          balance: formatCoins(
                            balancesRegistry.get(k).balance,
                            4
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
                  // return dragoTransactionsLogs
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
              } Holder transactions loaded in ${Seconds_Between_Dates}s *****`
            )
          } else {
            console.log(
              `***** ${moment().format()} Utils: ${
                options.drago ? 'DRAGO' : 'VAULT'
              } Manager transactions loaded in ${Seconds_Between_Dates}s *****`
            )
          }
          return results
        })
    })
  })
}
