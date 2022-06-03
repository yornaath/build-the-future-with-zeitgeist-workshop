import { Db } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import { blockNumberOf, Repo, tail } from '@tick-tack-block/lib'
import * as Cursor from './model/cursor'
import * as Game from './model/game'

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

  const persistence = Repo.db<Game.GameAggregate, 'marketId'>(
    db,
    'games',
    'marketId',
  )

  return tail(sdk.api, cursor, async ([block, blockEvents]) => {
    await Game.aggregate(sdk, persistence, [block, blockEvents])
    await Cursor.put(db, 'games', blockNumberOf(block))
  })
}
