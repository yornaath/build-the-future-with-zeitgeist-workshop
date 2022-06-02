import { Db } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from '@zeitgeistpm/sdk/dist/types'
import { SignedBlock } from '@polkadot/types/interfaces'
import { blockNumberOf, readMultiHash, tail } from '@tick-tack-block/lib'
import * as GameState from '@tick-tack-block/gamelogic/src/gamestate'
import * as Cursor from '../cursor'
import * as GameAggregate from './game'
import * as GameEvents from './events'

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

export const runWithDb = async (db: Db, sdk: SDK) => {
  const cursor = await Cursor.get(db, sdk, 'games')
  const aggregates = GameAggregate.db(db)

  return tail(sdk.api, cursor, async block => {
    const blockNumber = blockNumberOf(block)
    await aggregate(sdk, aggregates, block)
    await Cursor.put(db, 'games', blockNumber)
  })
}

/**
 *
 * Process a block and put to persistence.
 *
 * @param sdk @zeitgeistpm/sdk
 * @param aggregates GameAggregatePersistence
 * @param block SignesBlock
 */
export const aggregate = async (
  sdk: SDK,
  aggregates: GameAggregate.GameAggregatePersistence,
  block: SignedBlock,
) => {
  const blockNumber = blockNumberOf(block)
  const events = await GameEvents.parseBlockEvents(sdk, block)

  for (const event of events) {
    switch (event.type) {
      case 'newgame': {
        const metadata: DecodedMarketMetadata & {
          categories: CategoryMetadata
        } = JSON.parse(await readMultiHash(event.market.metadata))

        await aggregates.put({
          marketId: event.market.marketId,
          state: GameState.create(blockNumber, {
            challenger: metadata.categories[0].name,
            challenged: metadata.categories[1].name,
          }),
        })

        break
      }

      case 'turn': {
        const game = await aggregates.get(event.marketId)

        if (game) {
          await aggregates.put({
            marketId: game.marketId,
            state: GameState.turn(game.state, event.turn),
          })
        }

        break
      }

      // case 'ended': {
      //   const market = await sdk.models.fetchMarketData(event.marketId)
      //   const game = await aggregates.get(market.marketId)

      //   if (game) {
      //     const winner = GameState.judge(game.state)

      //     const winningCategoryIndex = market.categories?.findIndex(
      //       cat => cat.name === winner,
      //     )

      //     if (winningCategoryIndex) {
      //       await market.reportOutcome(oracle, {
      //         categorical: winningCategoryIndex,
      //       })
      //     }
      //   }

      //   break
      // }
    }
  }
}
