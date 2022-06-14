import type { KeyringPair } from '@polkadot/keyring/types'
import SDK from '@zeitgeistpm/sdk'
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from '@zeitgeistpm/sdk/dist/types'
import {
  BlockEventsPair,
  blockNumberOf,
  readMultiHash,
  Repo,
} from '@tick-tack-block/lib'
import * as GameState from '@tick-tack-block/gamelogic/src/gamestate'
import * as GameEvents from './event'

/**
 * GameAggregate Model
 *
 * Represents a game aggregate/snapshot made from a list
 * of parset block events and extrinsics.
 *
 */

export type GameAggregate = {
  marketId: string
  state: GameState.GameState
  resolved?: boolean
}

/**
 *
 * Process a block and put to persistence repo.
 *
 * @param sdk @zeitgeistpm/sdk
 * @param repo Repo.Repo<GameAggregate, 'marketId'>
 * @param blockEventPairs BlockEventsPair
 */

export const aggregate = async (
  sdk: SDK,
  repo: Repo.Repo<GameAggregate, 'marketId'>,
  [block, events]: BlockEventsPair,
  signer?: KeyringPair,
) => {
  const blockNumber = blockNumberOf(block)
  const gameEvents = await GameEvents.parseBlockEvents(sdk, [block, events])

  for (const event of gameEvents) {
    switch (event.type) {
      case 'newgame': {
        const metadata: DecodedMarketMetadata & {
          categories: CategoryMetadata
        } = JSON.parse(await readMultiHash(event.market.metadata))

        await repo.put({
          marketId: event.market.marketId,
          state: GameState.empty(blockNumber, {
            challenger: metadata.categories[0].name,
            challenged: metadata.categories[1].name,
          }),
        })

        break
      }

      case 'turn': {
        const game = await repo.get(event.marketId.toString())

        if (game) {
          await repo.put({
            marketId: game.marketId,
            state: GameState.turn(game.state, event.turn),
          })
        }

        break
      }

      case 'ended': {
        const game = await repo.get(event.marketId.toString())

        if (!game?.resolved && game?.state.type === 'finished') {
          const winner = game.state.winner

          const market = await sdk.models.fetchMarketData(
            Number(event.marketId.toString()),
          )

          const assetId = market.categories?.findIndex(
            cat => cat.name === winner,
          )

          if (!assetId) {
            console.warn('Invariant, no asset id.')
            break
          }

          if (signer) {
            await market.reportOutcome(signer, { categorical: assetId })
          }

          await repo.put({
            ...game,
            resolved: true,
          })
        }
      }
    }
  }
}
