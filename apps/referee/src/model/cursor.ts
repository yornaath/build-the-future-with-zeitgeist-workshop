import { Db, ClientSession } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import { blockNumberOf, latestBlock } from '@tick-tack-block/lib'

/**
 *
 * Get the last processes block.
 *
 * @param db mongodb.DB
 * @param sdk @zeitgeist.pm/SDK
 * @returns number
 */

export const get = async (db: Db, sdk: SDK, key: string) => {
  const lastProcessedBlock = await db.collection('cursors').findOne({ key })

  let cursor: number

  if (lastProcessedBlock) {
    cursor = lastProcessedBlock.number
  } else {
    const currentBlock = await latestBlock(sdk.api)
    const currentBlockNumber = blockNumberOf(currentBlock)
    cursor = currentBlockNumber
  }

  return cursor
}

/**
 *
 * Set the processes block cursor.
 *
 * @param db mongodb.DB
 * @param blockNumber number
 * @param session mongodb.ClientSession - for transactions. Unimplemented
 */

export const put = async (
  db: Db,
  key: string,
  blockNumber: number,
  session?: ClientSession,
) => {
  await db
    .collection('cursors')
    .findOneAndUpdate(
      { key },
      { $set: { number: blockNumber } },
      { upsert: true, session },
    )
}
