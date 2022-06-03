import SDK from '@zeitgeistpm/sdk'
import { EventRecord, SignedBlock } from '@polkadot/types/interfaces'
import * as GS from '@tick-tack-block/gamelogic/src/gamestate'
import { Vec } from '@polkadot/types'
import {
  BlockEventsPair,
  blockNumberOf,
  extrinsicsAtEvent,
} from '@tick-tack-block/lib'

/**
 * Represents a chain game event.
 */

export type GameEvent =
  | { type: 'newgame'; market: any }
  | { type: 'turn'; marketId: number; turn: GS.Turn }
  | { type: 'ended'; marketId: number }

/**
 *
 * Extracts the relevant game events from the block events and extrinsics
 *
 * @param api ApiProise
 * @param blockEventPair BlockEventsPair
 * @returns GameEvent[]
 */

export const parseBlockEvents = (
  sdk: SDK,
  [block, events]: BlockEventsPair,
): GameEvent[] => {
  const api = sdk.api
  const blockNumber = blockNumberOf(block)

  const gameEvents = events
    .map<GameEvent | GameEvent[] | null>(event => {
      if (api.events.predictionMarkets.MarketCreated.is(event.event)) {
        const [marketId, marketAccountId, market] =
          event.event.data.toHuman() as any
        return {
          type: 'newgame',
          market: { marketId, marketAccountId, ...market },
        }
      }

      if (api.events.system.Remarked.is(event.event)) {
        const extrinsics = extrinsicsAtEvent(events, block, {
          method: 'remarkWithEvent',
        })

        const turns = extrinsics
          .map(ex => {
            const signer = ex.signer.toString()
            const remark = ex.method.args.at(0)
            const rawturn = JSON.parse((remark?.toHuman() as string) || 'null')
            if (!rawturn) return null
            return {
              type: 'turn',
              marketId: rawturn.marketId,
              turn: {
                ...rawturn.turn,
                blockNumber,
                player: signer,
              },
            } as GameEvent
          })
          .filter((turn): turn is GameEvent => Boolean(turn))

        return turns
      }

      if (api.events.predictionMarkets.MarketEnded.is(event.event)) {
        const [marketId] = (event as any).event.data.toHuman() as any
        return {
          type: 'ended',
          marketId,
        }
      }

      return null
    })
    .filter((gameEvent): gameEvent is GameEvent => Boolean(gameEvent))

  return gameEvents.flat()
}
