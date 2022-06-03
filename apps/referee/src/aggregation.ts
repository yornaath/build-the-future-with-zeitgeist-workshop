import { Db } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import { blockNumberOf, tail } from '@tick-tack-block/lib'
import * as Cursor from './model/cursor'
import * as GameAggregate from './model/game/game'
import { aggregate } from './model/game/aggregator'

/**
 * Run the game state aggregator.
 *
 * Tails the chain from the last processed block, looks for the relevant events
 * like MarketCreated(new game), Remarked(turn) and MarketEnded(report outcome)
 *
 * @param db mongodb.Db
 * @param sdk @zeitgeistpm/sdk
 * @returns Promise<VoidFn | undefined>
 */

export const aggregateGames = async (db: Db, sdk: SDK) => {
  const cursor = await Cursor.get(db, sdk, 'games')
  const aggregates = GameAggregate.db(db)

  return tail(sdk.api, cursor, async ([block, blockEvents]) => {
    const blockNumber = blockNumberOf(block)
    await aggregate(sdk, aggregates, block, blockEvents)
    await Cursor.put(db, 'games', blockNumber)
  })
}
