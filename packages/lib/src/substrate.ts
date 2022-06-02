import { ApiPromise } from '@polkadot/api'
import { VoidFn } from '@polkadot/api/types'
import { Vec } from '@polkadot/types'
import { EventRecord, SignedBlock } from '@polkadot/types/interfaces'

/**
 *
 * Get the block number of a block.
 *
 * @param block SignedBlock
 * @returns number
 */
export const blockNumberOf = (block: SignedBlock) => {
  return parseInt(block.block.header.number.toString().replace(/,/g, ''))
}

/**
 *
 * Get the latest block
 *
 * @param api ApiPromise
 * @returns SignedBlock
 */
export const latestBlock = async (api: ApiPromise) => api.rpc.chain.getBlock()

/**
 *
 * Tails the chain for new blocks from a given blocknumber
 *
 * @param api ApiPromise
 * @param nr number - block number to tail from
 * @param cb function - callback to invoke on new block
 * @returns function? - unsubscribe
 */
export const tail = async (
  api: ApiPromise,
  nr: number,
  cb: (block: SignedBlock) => Promise<void>,
): Promise<VoidFn | undefined> => {
  const block = await blockAt(api, nr)

  if (!block) {
    return await api.rpc.chain.subscribeFinalizedHeads(header => {
      return api.rpc.chain.getBlock(header.hash).then(async block => {
        return await cb(block)
      })
    })
  } else {
    await cb(block)
    return tail(api, nr + 1, cb)
  }
}

/**
 *
 * Get the block at a certain blocknumber if it exists.
 *
 * @param api ApiPromise
 * @param nr number
 * @returns SignedBlock | null
 */
export const blockAt = async (
  api: ApiPromise,
  nr: number,
): Promise<SignedBlock | null> => {
  try {
    const block = await api.rpc.chain
      .getBlockHash(nr)
      .then(hash => api.rpc.chain.getBlock(hash))
    return block
  } catch (error) {
    return null
  }
}

/**
 *
 * Get the extrinsics in a block mapped by EventRecord.
 *
 * @param events Vec<EventRecord>
 * @param block SignedBlock
 * @param filter.method string
 * @returns
 */
export const extrinsicsAtEvent = (
  events: Vec<EventRecord>,
  block: SignedBlock,
  filter?: {
    method?: string
  },
) => {
  return block.block.extrinsics.filter((ex, index) =>
    Boolean(
      events.find(
        event =>
          event.phase.isApplyExtrinsic &&
          event.phase.asApplyExtrinsic.eq(index) &&
          (!filter?.method || ex.method.method.toString() === filter.method),
      ),
    ),
  )
}
