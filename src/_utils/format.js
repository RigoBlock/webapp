// Copyright 2016-2017 Rigo Investment Sagl.

import BigNumber from 'bignumber.js'

const DIVISOR = 10 ** 6
const ZERO = new BigNumber(0)

export const formatPrice = price => {
  const number = Number(price)
  if (number < 100) {
    return number.toFixed(4)
  }
  if (number < 1000) {
    return number.toFixed(3)
  }
  if (number < 10000) {
    return number.toFixed(2)
  }
  if (number < 100000) {
    return number.toFixed(1)
  }
  return number.toFixed(4)
}

export const formatPriceTrades = price => {
  const number = Number(price)
  if (number < 1) {
    return number.toFixed(4)
  }
  if (number < 10) {
    return number.toFixed(2)
  }
  if (number < 1000) {
    return number.toFixed(1)
  }
  if (number < 10000) {
    return number.toFixed(1)
  }
  if (number < 100000) {
    return number.toFixed(1)
  }
  return number.toFixed(1)
}

/**
 * A unit amount is defined as the amount of a token above the specified decimal places (integer part).
 * E.g: If a currency has 18 decimal places, 1e18 or one quintillion of the currency is equivalent
 * to 1 unit.
 * @param   amount      The amount in baseUnits that you would like converted to units.
 * @param   decimals    The number of decimal places the unit amount has.
 * @return  The amount in units.
 */
export function toUnitAmount(amount, decimals) {
  const aUnit = new BigNumber(10).pow(decimals)
  const unit = new BigNumber(amount).div(aUnit)
  return unit
}
/**
 * A baseUnit is defined as the smallest denomination of a token. An amount expressed in baseUnits
 * is the amount expressed in the smallest denomination.
 * E.g: 1 unit of a token with 18 decimal places is expressed in baseUnits as 1000000000000000000
 * @param   amount      The amount of units that you would like converted to baseUnits.
 * @param   decimals    The number of decimal places the unit amount has.
 * @return  The amount in baseUnits.
 */
export function toBaseUnitAmount(amount, decimals) {
  const unit = new BigNumber(10).pow(decimals)
  const baseUnitAmount = new BigNumber(amount).times(unit)
  const hasDecimals = baseUnitAmount.decimalPlaces() !== 0
  if (hasDecimals) {
    throw new Error(
      `Invalid unit amount: ${amount.toString()} - Too many decimal places`
    )
  }
  return baseUnitAmount
}

export function formatBlockNumber(blockNumber) {
  return ZERO.eq(blockNumber || 0) ? 'Pending' : `#${blockNumber.toFormat()}`
}

export function formatCoins(amount, decimals = 4) {
  //prev. decimals = 6
  // console.log(amount.toNumber())

  const adjusted = new BigNumber(amount).div(DIVISOR)
  if (decimals === -1) {
    if (adjusted.gte(10000)) {
      decimals = 0
    } else if (adjusted.gte(1000)) {
      decimals = 1
    } else if (adjusted.gte(100)) {
      decimals = 2
    } else if (adjusted.gte(10)) {
      decimals = 3
    } else {
      decimals = 4
    }
  }

  return adjusted.toFormat(decimals)
}

export function formatEth(eth, decimals = 4) {
  // console.log(new BigNumber(eth))
  // let web3 = new Web3()
  // let BN = web3.utils.BN

  // console.log(BN(eth))

  // console.log(new BN(1234).toString())

  return toUnitAmount(new BigNumber(eth), 18).toFormat(decimals)

  // return web3.utils.fromWei(new BN(eth)).toFormat(decimals)
}

export function formatHash(hash) {
  return `${hash.substr(0, 10)}...${hash.substr(-8)}`
}

export function toHex(str) {
  if (str && str.toString) {
    str = str.toString(16)
  }

  if (str && str.substr(0, 2) === '0x') {
    return str.toLowerCase()
  }

  return `0x${(str || '').toLowerCase()}`
}
