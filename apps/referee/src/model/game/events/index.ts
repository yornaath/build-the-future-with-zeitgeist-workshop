import SDK from "@zeitgeistpm/sdk";
import { EventRecord, SignedBlock } from "@polkadot/types/interfaces";
import * as GS from "@tick-tack-block/gamelogic/src/gamestate";
import { Vec } from "@polkadot/types";
import { blockNumberOf, extrinsicsAtEvent } from "@tick-tack-block/lib";

/**
 * Represents a chain game event.
 */
export type GameEvent =
  | { type: "newgame"; market: any }
  | { type: "turn"; slug: string; turn: GS.Turn };

/**
 *
 * Extracts the relevant game events from the block events and extrinsics
 *
 * @param api ApiProise
 * @param block SignedBlock
 * @returns GameEvent[]
 */
export const parseBlockEvents = async (
  sdk: SDK,
  block: SignedBlock
): Promise<GameEvent[]> => {
  const api = sdk.api;
  const blockNumber = blockNumberOf(block);

  const blockEvents = await (
    await api.at(block.block.header.hash.toHex())
  ).query.system.events<Vec<EventRecord>>();

  const events = blockEvents
    .map<GameEvent | GameEvent[] | null>((event) => {
      if (api.events.predictionMarkets.MarketCreated.is(event.event)) {
        const [marketId, marketAccountId, market] =
          event.event.data.toHuman() as any;
        return {
          type: "newgame",
          market: { marketId, marketAccountId, ...market },
        };
      }

      if (api.events.system.Remarked.is(event.event)) {
        const extrinsics = extrinsicsAtEvent(blockEvents, block, {
          method: "remarkWithEvent",
        });

        const turns = extrinsics
          .map((ex) => {
            const signer = ex.signer.toString();
            const remark = ex.method.args.at(0);
            const rawturn = JSON.parse((remark?.toHuman() as string) || "null");
            if (!rawturn) return null;
            return {
              type: "turn",
              slug: rawturn.slug,
              turn: {
                ...rawturn.turn,
                blockNumber,
                player: signer,
              },
            } as GameEvent;
          })
          .filter((turn): turn is GameEvent => Boolean(turn));

        return turns;
      }

      return null;
    })
    .filter((event): event is GameEvent => Boolean(event));

  return events.flat();
};
