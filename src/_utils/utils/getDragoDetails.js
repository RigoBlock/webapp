import { dateFromTimeStampHuman } from './dateFromTimeStampHuman'
import { ethers } from 'ethers'
import { formatCoins, formatEth } from './../format'
import { getBlockChunks } from './blockChunks'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3 from 'web3'
import Web3Wrapper from '../web3Wrapper/src'

export const getDragoDetails = async (
  dragoDetails,
  accounts,
  api,
  options = { dateOnly: false }
) => {
  //
  // Initializing Drago API
  //
  let web3Http = new Web3(api._rb.network.transportHttp)
  let newWeb3 = Web3Wrapper.getInstance(api._rb.network.id)

  newWeb3._rb = window.web3._rb
  web3Http._rb = window.web3._rb
  const poolApiWeb3 = new PoolApi(api)

  const dragoAddress = dragoDetails[0][0]
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

  await Promise.all([
    poolApiWeb3.contract.dragoeventful.init(),
    poolApiWeb3.contract.drago.init(dragoAddress)
  ]).catch(e => new Error(e))

  //
  // Getting drago data, creation date, supply, ETH balances
  //

  const getDragoCreationDate = async address => {
    const hexPoolAddress = '0x' + address.substr(2).padStart(64, '0')

    let topics = [
      [poolApiWeb3.contract.dragoeventful.hexSignature.DragoCreated],
      [hexPoolAddress],
      null,
      null
    ]

    let arrayPromises = []
    return newWeb3.eth.getBlockNumber().then(async lastBlock => {
      let chunck = 100000
      lastBlock = new BigNumber(lastBlock).toNumber()
      const chunks = await getBlockChunks(fromBlock, lastBlock, chunck, newWeb3)
      // const chunks = blockChunks(fromBlock, lastBlock, chunck)
      arrayPromises = chunks.map(async chunk => {
        // Pushing chunk logs into array
        let options = {
          topics: topics,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        }
        // let contractHttp = new web3Http.eth.Contract(
        //   poolApiWeb3.contract.dragoeventful._abi,
        //   poolApiWeb3.contract.dragoeventful._contractAddress
        // )

        // return contractHttp
        //   .getPastEvents('allEvents', {
        //     fromBlock: options.fromBlock,
        //     toBlock: options.toBlock,
        //     topics: options.topics
        //   })
        //   .then(logs => {
        //     console.log(logs)
        //     return logs
        //   })

        return poolApiWeb3.contract.dragoeventful
          .getAllLogs(options)
          .then(logs => {
            return logs
          })
          .catch(error => {
            console.warn(error)
            throw Error(error)
          })
      })

      return Promise.all(arrayPromises)
        .then(results => {
          if (results.length > 0) {
            let logs = [].concat(...results)
            if (logs.length !== 0) {
              return newWeb3.eth
                .getBlock(logs[0].blockNumber.toFixed(0))
                .then(result => {
                  let date
                  try {
                    date = dateFromTimeStampHuman(result.timestamp)
                  } catch (error) {
                    date = '01 January 1970'
                  }
                  return date
                })
                .catch(error => {
                  console.warn(error)
                  throw new Error(error)
                })
            } else {
              return '01 January 1970'
            }
          } else {
            return '01 January 1970'
          }
        })
        .catch(error => {
          console.warn(error)
          throw Error(error)
        })
    })
  }

  if (options.dateOnly) {
    let dragoCreatedDate = await getDragoCreationDate(dragoAddress)
    let details = {
      address: dragoAddress,
      created: dragoCreatedDate
    }
    return details
  }

  let balanceDRG = new BigNumber(0)
  let dragoData = poolApiWeb3.contract.drago.getData()
  let dragoTotalSupply = poolApiWeb3.contract.drago.totalSupply()
  let dragoETH = poolApiWeb3.contract.drago.getBalance()
  let dragoWETH = poolApiWeb3.contract.drago.getBalanceWETH()

  //
  // Getting balance for each user account
  //
  if (accounts.length > 1) {
    balanceDRG = Promise.all(
      accounts.map(async account => {
        const balance = await poolApiWeb3.contract.drago
          .balanceOf(account.address)
          .catch(e => new Error(e))
        balanceDRG = balanceDRG.plus(balance)
      })
    )
  } else {
    balanceDRG = poolApiWeb3.contract.drago.balanceOf(accounts[0].address)
  }

  try {
    dragoData = await dragoData
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    dragoTotalSupply = await dragoTotalSupply
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    dragoETH = await dragoETH
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    dragoWETH = await dragoWETH
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    balanceDRG = await balanceDRG
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  // try {
  //   ;[
  //     // dragoCreatedDate,
  //     dragoData,
  //     dragoTotalSupply,
  //     dragoETH,
  //     dragoWETH,
  //     balanceDRG
  //   ] = await Promise.all([
  //     // dragoCreatedDate,
  //     dragoData,
  //     dragoTotalSupply,
  //     dragoETH,
  //     dragoWETH,
  //     balanceDRG
  //   ]).catch(e => {
  //     console.log(e)
  //     return new Error(e)
  //   })
  //   console.log(
  //     // dragoCreatedDate,
  //     dragoData,
  //     dragoTotalSupply,
  //     dragoETH,
  //     dragoWETH,
  //     balanceDRG
  //   )
  // } catch (e) {
  //   console.log(e)
  //   return new Error(e)
  // }

  let sellPrice = ethers.utils.bigNumberify(dragoData[2]).toHexString()
  let buyPrice = ethers.utils.bigNumberify(dragoData[3]).toHexString()

  sellPrice = api.utils.fromWei(sellPrice)
  buyPrice = api.utils.fromWei(buyPrice)

  sellPrice = new BigNumber(sellPrice).toFormat(4)
  buyPrice = new BigNumber(buyPrice).toFormat(4)

  let details = {
    address: dragoDetails[0][0],
    name:
      dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
    symbol: dragoDetails[0][2],
    dragoId: new BigNumber(dragoDetails[0][3]).toFixed(),
    addressOwner: dragoDetails[0][4],
    addressGroup: dragoDetails[0][5],
    sellPrice,
    buyPrice,
    // created: dragoCreatedDate,
    totalSupply: formatCoins(new BigNumber(dragoTotalSupply), 4),
    dragoETHBalance: formatEth(dragoETH, 4),
    dragoWETHBalance: formatEth(dragoWETH, 4),
    balanceDRG: formatCoins(balanceDRG, 4)
  }

  return details
}
