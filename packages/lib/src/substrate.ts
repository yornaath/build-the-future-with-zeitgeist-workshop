import { ApiPromise } from '@polkadot/api'
import { VoidFn } from '@polkadot/api/types'
import { Vec } from '@polkadot/types'
import limit from 'p-limit'
import { Block, EventRecord, SignedBlock } from '@polkadot/types/interfaces'
import { range } from './array'

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
  cb: (block: BlockEventsPair) => Promise<void>,
): Promise<VoidFn | undefined> => {
  const block = await blockAt(api, nr)

  if (!block) {
    return await api.rpc.chain.subscribeFinalizedHeads(header => {
      return api.rpc.chain.getBlock(header.hash).then(async block => {
        return await cb(await mapEventsToBlock(api, block))
      })
    })
  } else {
    await cb(await mapEventsToBlock(api, block))
    return tail(api, nr + 1, cb)
  }
}

/**
 * Block and Events Tuple
 */

export type BlockEventsPair = [SignedBlock, Vec<EventRecord>]

/**
 *
 * Fetch Events for a given block and return the pair.
 *
 * @param api ApiPromise
 * @param block SignedBlock
 * @returns BlockEventsPair
 */

export const mapEventsToBlock = async (
  api: ApiPromise,
  block: SignedBlock,
): Promise<BlockEventsPair> => {
  const blockEvents = await (
    await api.at(block.block.header.hash.toHex())
  ).query.system.events<Vec<EventRecord>>()
  return [block, blockEvents]
}

/**
 *
 * Get a slice of blocks
 *
 * @param api ApiPromise
 * @param from number - start block
 * @param to number - end block
 * @returns Awaitable<SignedBlock[]>
 */
export const slice = async (
  api: ApiPromise,
  from: number,
  to: number,
  progressListener?: (percentage: number) => void,
): Promise<BlockEventsPair[]> => {
  const concurrency = limit(20)
  const total = to - from
  let processed = 0
  return (
    await Promise.all(
      range(from, to).map(blockNumber =>
        concurrency(async () => {
          const block = await blockAt(api, blockNumber)
          processed++
          progressListener?.((100 / total) * processed)
          if (block) {
            return await mapEventsToBlock(api, block)
          }
        }),
      ),
    )
  ).filter((block): block is BlockEventsPair => Boolean(block))
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
