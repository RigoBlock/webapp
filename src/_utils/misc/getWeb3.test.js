import { METAMASK } from '../const'
import { getWeb3 } from './getWeb3'

beforeEach = async () => {}

describe('getWeb3 util', () => {
  it('1 -> return ganache instance success', async () => {
    const options = { wallet: '' }
    const networkInfo = { id: 5777 }
    const web3 = getWeb3(networkInfo, options)
    let isGanache = false
    try {
      if (
        web3.currentProvider.host &&
        web3.currentProvider.host.indexOf('localhost') !== -1
      ) {
        isGanache = true
      }
    } catch (error) {}
    expect(isGanache).toBe(true)
  })
  it('2 -> return MM web3 success', async () => {
    const options = { wallet: METAMASK }
    const networkInfo = { id: '' }
    const web3 = getWeb3(networkInfo, options)
    expect(web3).toBe('Test env')
  })
  it('3 -> return default web3 success', async () => {
    const options = { wallet: '' }
    const networkInfo = { id: '' }
    const web3 = getWeb3(networkInfo, options)
    let isDefault = false
    try {
      if (web3.currentProvider === null) {
        isDefault = true
      }
    } catch (error) {}
    expect(isDefault).toBe(true)
  })
})
