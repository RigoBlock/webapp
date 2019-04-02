import Web3 from 'web3'

export const newWeb3 = provider => {
  return new Web3(provider)
}

export const errorMsg = error => {
  return error.charAt(0).toUpperCase() + error.slice(1)
}

export const blockChunks = (start, end, chunk) => {
  let rangesArray = []
  let i = 0
  let fromBlock = end - chunk
  let toBlock = end

  if (end - chunk < start) {
    rangesArray.push({
      fromBlock: start,
      toBlock: 'latest'
    })
    // console.log(
    //   `***** Chunk ${i} -> fromBlock ${start} -> toBlock ${end} ('latest')`
    // )
    return rangesArray
  }
  while (toBlock > start) {
    if (i === 0) {
      rangesArray.push({
        fromBlock: fromBlock + 1,
        toBlock: 'latest'
      })
    } else {
      rangesArray.push({
        fromBlock: fromBlock + 1,
        toBlock: toBlock
      })
    }
    // console.log(
    //   `***** Chunk ${i} -> fromBlock ${fromBlock + 1} -> toBlock ${toBlock}`
    // )
    i++
    // fromBlock = fromBlock - chunk
    // toBlock = toBlock - chunk
    if (i > 100) break
    if (fromBlock - chunk < start) {
      rangesArray.push({
        fromBlock: Number(start),
        toBlock: fromBlock
      })
      // console.log(
      //   `***** Chunk ${i} -> fromBlock ${Number(
      //     start
      //   )} -> toBlock ${fromBlock}`
      // )
      break
    }
    fromBlock = fromBlock - chunk
    toBlock = toBlock - chunk
  }
  // logger.info(`${JSON.stringify(rangesArray)}`)
  /*rangesArray.map((chunk, key) => {
    // console.log(
    //   `***** Chunk ${key} -> fromBlock ${chunk.fromBlock} -> toBlock ${
    //     chunk.toBlock
    //   }`
    // )
  })*/
  return rangesArray
}
