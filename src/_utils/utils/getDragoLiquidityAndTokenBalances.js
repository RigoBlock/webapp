// import * as abis from '../PoolsApi/src/contracts/abi'
import { getTokenWrapperLockTime } from './getTokenWrapperLockTime'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3Wrapper from '../web3Wrapper/src'

export const getDragoLiquidityAndTokenBalances2 = async (
  dragoAddress,
  api,
  selectedTokensPair,
  exchange
) => {
  let newWeb3 = Web3Wrapper.getInstance(api._rb.network.id)
  newWeb3._rb = window.web3._rb
  const poolApi = new PoolApi(newWeb3)
  poolApi.contract.drago.init(dragoAddress)
  let { baseTokenLockWrapExpire, quoteTokenLockWrapExpire } = selectedTokensPair
  let dragoETHBalance = await poolApi.contract.drago.getBalance()
  // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
  let baseTokenBalance =
    selectedTokensPair.baseToken.address !== '0x0'
      ? await poolApi.contract.drago.getPoolBalanceOnToken(
          selectedTokensPair.baseToken.address
        )
      : await poolApi.contract.drago.getBalance()

  let quoteTokenBalance =
    selectedTokensPair.quoteToken.address !== '0x0'
      ? await poolApi.contract.drago.getPoolBalanceOnToken(
          selectedTokensPair.quoteToken.address
        )
      : await poolApi.contract.drago.getBalance()

  let baseTokenWrapperBalance,
    quoteTokenWrapperBalance = new BigNumber(0)
  if (exchange.isTokenWrapper) {
    // Getting token wrapper balance
    baseTokenWrapperBalance = await poolApi.contract.drago.getPoolBalanceOnToken(
      selectedTokensPair.baseToken.wrappers[exchange.name].address
    )
    quoteTokenWrapperBalance = await poolApi.contract.drago.getPoolBalanceOnToken(
      selectedTokensPair.quoteToken.wrappers[exchange.name].address
    )
    // Getting token wrapper lock time
    baseTokenLockWrapExpire = await getTokenWrapperLockTime(
      api,
      selectedTokensPair.baseToken.wrappers[exchange.name].address,
      dragoAddress
    )
    // console.log(
    //   `Exp base token: ${moment
    //     .unix(baseTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    quoteTokenLockWrapExpire = await getTokenWrapperLockTime(
      api,
      selectedTokensPair.quoteToken.wrappers[exchange.name].address,
      dragoAddress
    )
    //   console.log(
    //   `Exp quote token: ${moment
    //     .unix(quoteTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
  }

  const liquidity = {
    dragoETHBalance,
    // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
    baseTokenBalance,
    baseTokenWrapperBalance,
    quoteTokenBalance,
    quoteTokenWrapperBalance
  }
  for (let key in liquidity) {
    liquidity[key] = new BigNumber(liquidity[key])
  }

  liquidity.baseTokenLockWrapExpire = baseTokenLockWrapExpire
  liquidity.quoteTokenLockWrapExpire = quoteTokenLockWrapExpire

  return liquidity
}

export const getDragoLiquidityAndTokenBalances = async (
  dragoAddress,
  api,
  selectedTokensPair,
  exchange
) => {
  let newWeb3 = Web3Wrapper.getInstance(api._rb.network.id)
  newWeb3._rb = window.web3._rb
  const poolApi = new PoolApi(newWeb3)
  poolApi.contract.drago.init(dragoAddress)
  let { baseTokenLockWrapExpire, quoteTokenLockWrapExpire } = selectedTokensPair

  // ETH BALANCE
  let dragoETHBalance = poolApi.contract.drago.getBalance()
  // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),

  // TOKEN BALANCES
  let baseTokenBalance =
    selectedTokensPair.baseToken.address !== '0x0'
      ? poolApi.contract.drago.getPoolBalanceOnToken(
          selectedTokensPair.baseToken.address
        )
      : dragoETHBalance

  let quoteTokenBalance =
    selectedTokensPair.quoteToken.address !== '0x0'
      ? poolApi.contract.drago.getPoolBalanceOnToken(
          selectedTokensPair.quoteToken.address
        )
      : dragoETHBalance

  // WRAPPERS BALANCES
  let baseTokenWrapperBalance = () => new BigNumber(0)
  let quoteTokenWrapperBalance = () => new BigNumber(0)
  if (exchange.isTokenWrapper) {
    // Getting token wrapper balance
    baseTokenWrapperBalance = poolApi.contract.drago.getPoolBalanceOnToken(
      selectedTokensPair.baseToken.wrappers[exchange.name].address
    )
    quoteTokenWrapperBalance = poolApi.contract.drago.getPoolBalanceOnToken(
      selectedTokensPair.quoteToken.wrappers[exchange.name].address
    )
    // Getting token wrapper lock time
    baseTokenLockWrapExpire = getTokenWrapperLockTime(
      api,
      selectedTokensPair.baseToken.wrappers[exchange.name].address,
      dragoAddress
    )

    // console.log(
    //   `Exp base token: ${moment
    //     .unix(baseTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    quoteTokenLockWrapExpire = getTokenWrapperLockTime(
      api,
      selectedTokensPair.quoteToken.wrappers[exchange.name].address,
      dragoAddress
    )
    //   console.log(
    //   `Exp quote token: ${moment
    //     .unix(quoteTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
  }
  try {
    ;[
      dragoETHBalance,
      baseTokenBalance,
      baseTokenWrapperBalance,
      quoteTokenBalance,
      quoteTokenWrapperBalance,
      baseTokenLockWrapExpire,
      quoteTokenLockWrapExpire
    ] = await Promise.all([
      dragoETHBalance,
      baseTokenBalance,
      baseTokenWrapperBalance,
      quoteTokenBalance,
      quoteTokenWrapperBalance,
      baseTokenLockWrapExpire,
      quoteTokenLockWrapExpire
    ])
  } catch (e) {
    throw new Error(e)
  }

  const liquidity = {
    dragoETHBalance: new BigNumber(dragoETHBalance),
    // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
    baseTokenBalance: new BigNumber(baseTokenBalance),
    baseTokenWrapperBalance: new BigNumber(baseTokenWrapperBalance),
    quoteTokenBalance: new BigNumber(quoteTokenBalance),
    quoteTokenWrapperBalance: new BigNumber(quoteTokenWrapperBalance),
    baseTokenLockWrapExpire: baseTokenLockWrapExpire,
    quoteTokenLockWrapExpire: quoteTokenLockWrapExpire
  }
  return liquidity
}
