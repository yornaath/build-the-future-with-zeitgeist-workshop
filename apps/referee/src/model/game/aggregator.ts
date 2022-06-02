import { Db } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from '@zeitgeistpm/sdk/dist/types'
import { blockNumberOf, readMultiHash, tail } from '@tick-tack-block/lib'
import oracle from '../../oracle'
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

export const run = async (db: Db, sdk: SDK) => {
  const cursor = await Cursor.get(db, sdk, 'games')

  return tail(sdk.api, cursor, async block => {
    const blockNumber = blockNumberOf(block)
    const events = await GameEvents.parseBlockEvents(sdk, block)

    for (const event of events) {
      switch (event.type) {
        case 'newgame': {
          const metadata: DecodedMarketMetadata & {
            categories: CategoryMetadata
          } = JSON.parse(await readMultiHash(event.market.metadata))

          await GameAggregate.put(db, {
            marketId: event.market.marketId,
            state: GameState.create(blockNumber, {
              challenger: metadata.categories[0].name,
              challenged: metadata.categories[1].name,
            }),
          })

          break
        }

        case 'turn': {
          const game = await GameAggregate.get(db, event.marketId)

          if (game) {
            await GameAggregate.put(db, {
              marketId: game.marketId,
              state: GameState.turn(game.state, event.turn),
            })
          }

          break
        }

        case 'ended': {
          const market = await sdk.models.fetchMarketData(event.marketId)
          const game = await GameAggregate.get(db, market.marketId)

          if (game) {
            const winner = GameState.judge(game.state)

            const winningCategoryIndex = market.categories?.findIndex(
              cat => cat.name === winner,
            )

            if (winningCategoryIndex) {
              await market.reportOutcome(oracle, {
                categorical: winningCategoryIndex + 1,
              })
            }
          }

          break
        }
      }
    }

    await Cursor.put(db, 'games', blockNumber)
  })
}
