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
  slug: string
  state: GS.GameState
}

export const get = async (
  db: Db,
  slug: string,
): Promise<GameAggregate | null> => {
  return await db.collection('games').findOne<any>({ slug })
}

export const put = async (
  db: Db,
  game: GameAggregate,
  upsert: boolean,
  session?: ClientSession,
) => {
  return db
    .collection<GameAggregate>('games')
    .findOneAndReplace({ slug: game.slug }, game, {
      upsert,
      session,
    })
}

export const list = async (db: Db) => {
  return db.collection<GameAggregate>('games').find().toArray()
}
