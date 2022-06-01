import { Db, ClientSession } from 'mongodb'
import * as GS from '@tick-tack-block/gamelogic/src/gamestate'

/**
 * GameAggregate Model
 *
 * Represents a game aggregate/snapshot made from a list
 * of parset block events and extrinsics.
 *
 */

export type GameAggregate = {
  marketId: string
  state: GS.GameState
}

export const get = async (
  db: Db,
  marketId: number,
): Promise<GameAggregate | null> => {
  return await db.collection('games').findOne<GameAggregate>({ marketId })
}

export const put = async (
  db: Db,
  game: GameAggregate,
  session?: ClientSession,
) => {
  return db
    .collection<GameAggregate>('games')
    .findOneAndReplace({ marketId: game.marketId }, game, {
      upsert: true,
      session,
    })
}

export const list = async (db: Db) => {
  return db.collection<GameAggregate>('games').find().toArray()
}
