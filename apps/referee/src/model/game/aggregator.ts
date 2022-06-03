import SDK from '@zeitgeistpm/sdk'
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from '@zeitgeistpm/sdk/dist/types'
import { Vec } from '@polkadot/types'
import { EventRecord, SignedBlock } from '@polkadot/types/interfaces'
import {
  BlockEventsPair,
  blockNumberOf,
  readMultiHash,
  tail,
} from '@tick-tack-block/lib'
import * as GameState from '@tick-tack-block/gamelogic/src/gamestate'
import * as GameAggregate from './game'
import * as GameEvents from './events'

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
  [block, events]: BlockEventsPair,
) => {
  const blockNumber = blockNumberOf(block)
  const gameEvents = await GameEvents.parseBlockEvents(sdk, block, events)

  for (const event of gameEvents) {
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
    }
  }
}
