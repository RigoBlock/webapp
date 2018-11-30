// import * as abis from '../PoolsApi/src/contracts/abi'

import { formatCoins, formatEth } from './../format'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'

export const logToEvent = (log, dragoSymbolRegistry, api) => {
  const key = Web3.utils.sha3(JSON.stringify(log))

  const {
    address,
    blockNumber,
    event,
    logIndex,
    returnValues,
    transactionHash,
    transactionIndex
  } = log

  const hexToString = hex => {
    let string = ''
    for (let i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    }
    return string
  }

  // Getting the transaction amounts if it's a buy or sell event
  let ethvalue,
    drgvalue = 0

  if (
    typeof returnValues.amount !== 'undefined' &&
    typeof returnValues.revenue !== 'undefined'
  ) {
    ethvalue =
      event === 'BuyDrago' || event === 'BuyVault'
        ? formatEth(returnValues.amount, null)
        : formatEth(returnValues.revenue, null)
    drgvalue =
      event === 'SellDrago' || event === 'SellVault'
        ? formatCoins(returnValues.amount, null)
        : formatCoins(returnValues.revenue, null)
  }
  // Creating a map with list of dragos
  if (
    event === 'BuyDrago' ||
    event === 'DragoCreated' ||
    event === 'BuyVault' ||
    event === 'VaultCreated'
  ) {
    let poolAddress = returnValues.drago || returnValues.vault
    let data
    if (returnValues.drago) {
      data = {
        symbol: returnValues.symbol,
        vaultId: null,
        name: null,
        address: poolAddress
      }
    }
    if (returnValues.vault) {
      data = {
        symbol: returnValues.symbol,
        vaultId: null,
        name: null,
        address: poolAddress
      }
    }

    if (!dragoSymbolRegistry.has(poolAddress)) {
      dragoSymbolRegistry.set(poolAddress, data)
    }
  }
  let symbol
  if (typeof returnValues.symbol === 'string') {
    '0x' === returnValues.symbol.substring(0, 2)
      ? (symbol = hexToString(returnValues.symbol.substring(2)))
      : (symbol = returnValues.symbol)
  } else {
    for (let i = 0; i < returnValues.symbol.length; ++i) {
      symbol += String.fromCharCode(returnValues.symbol[i])
    }
  }
  return {
    address,
    type: event,
    blockNumber: new BigNumber(blockNumber),
    logIndex,
    transactionHash,
    transactionIndex,
    params: returnValues,
    key,
    ethvalue,
    drgvalue,
    symbol: symbol
  }
}
