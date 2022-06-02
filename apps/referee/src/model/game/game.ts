import type { Db } from 'mongodb'
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

export type GameAggregatePersistence = {
  get(marketId: number): Promise<GameAggregate | null>
  put(game: GameAggregate): Promise<void>
  list(): Promise<GameAggregate[]>
}

export const db = (db: Db): GameAggregatePersistence => {
  const get = async (marketId: number): Promise<GameAggregate | null> => {
    return await db.collection('games').findOne<GameAggregate>({ marketId })
  }

  const put = async (game: GameAggregate) => {
    await db
      .collection<GameAggregate>('games')
      .findOneAndReplace({ marketId: game.marketId }, game, {
        upsert: true,
      })
  }

  const list = async () => {
    return db.collection<GameAggregate>('games').find().toArray()
  }

  return { get, put, list }
}

export const memory = (
  db: Record<string, GameAggregate>,
): GameAggregatePersistence => {
  const get = async (marketId: number): Promise<GameAggregate | null> => {
    return await db[marketId]
  }

  const put = async (game: GameAggregate) => {
    db[game.marketId] = game
  }

  const list = async () => {
    return Object.values(db)
  }

  return { get, put, list }
}
