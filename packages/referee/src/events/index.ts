import SDK from "@zeitgeistpm/sdk";
import { ApiPromise } from "@polkadot/api";
import { VoidFn } from "@polkadot/api/types";
import { Event, EventRecord, SignedBlock } from "@polkadot/types/interfaces";
import * as GS from "@tick-tack-block/gamelogic/src/gamestate";
import { blockAt } from "../util/substrate";

import { inspect } from "util";
import { Codec, IEvent } from "@polkadot/types/types";
import { Vec } from "@polkadot/types";
import { blockNumberOf } from "@tick-tack-block/lib";

/**
 * Represents a chain game event.
 */
export type GameEvent =
  | { type: "newgame"; market: any }
  | { type: "turn"; slug: string; turn: GS.Turn };

/**
 *
 * Tails the chain for new blocks from a given blocknumber
 *
 * @param api ApiPromise
 * @param nr number - block number to tail from
 * @param cb function - callback to invoke on new block
 * @returns function? - unsubscribe
 */
export const tail = async (
  sdk: SDK,
  nr: number,
  cb: (events: GameEvent[], block: SignedBlock) => Promise<void>
): Promise<VoidFn | undefined> => {
  const api = sdk.api;
  const [block, last] = await blockAt(api, nr);

  if (last) {
    return await api.rpc.chain.subscribeFinalizedHeads((header) => {
      return api.rpc.chain.getBlock(header.hash).then(async (block) => {
        const events = await parseBlockEvents(sdk, block);
        return await cb(events, block);
      });
    });
  } else if (block) {
    const events = await parseBlockEvents(sdk, block);
    await cb(events, block);
    return tail(sdk, nr + 1, cb);
  }
};

/**
 *
 * Extracts the relevant game events from the block events and extrinsics
 *
 * @param api ApiProise
 * @param block SignedBlock
 * @returns Event[]
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
        const extrinsics = block.block.extrinsics.filter((ex, index) =>
          Boolean(
            blockEvents.find(
              (event) =>
                event.phase.isApplyExtrinsic &&
                event.phase.asApplyExtrinsic.eq(index) &&
                ex.method.method.toString() === "remarkWithEvent"
            )
          )
        );

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
