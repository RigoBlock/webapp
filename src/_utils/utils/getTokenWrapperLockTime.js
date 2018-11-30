import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3Wrapper from '../web3Wrapper/src'

export const getTokenWrapperLockTime = async (
  api,
  tokenAddress,
  accountAddress
) => {
  let newWeb3 = await Web3Wrapper.getInstance(api._rb.network.id)
  newWeb3._rb = window.web3._rb
  const poolApi = new PoolApi(newWeb3)
  await poolApi.contract.tokenwrapper.init(tokenAddress)
  const depositLockTime = await poolApi.contract.tokenwrapper.depositLock(
    accountAddress
  )
  return new BigNumber(depositLockTime).toFixed()
}
