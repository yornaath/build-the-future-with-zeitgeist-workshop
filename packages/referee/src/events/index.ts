import { ApiPromise } from "@polkadot/api";
import { VoidFn } from "@polkadot/api/types";
import { SignedBlock } from "@polkadot/types/interfaces";
import * as GS from "@tick-tack-block/gamelogic/src/gamestate";
import { blockNumberOf } from "@tick-tack-block/lib";
import { blockAt } from "../util/substrate";

/**
 * Represents a chain game event.
 */
export type Event =
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
  api: ApiPromise,
  nr: number,
  cb: (events: Event[], block: SignedBlock) => Promise<void>
): Promise<VoidFn | undefined> => {
  const [block, last] = await blockAt(api, nr);

  if (last) {
    return await api.rpc.chain.subscribeFinalizedHeads((header) => {
      return api.rpc.chain.getBlock(header.hash).then(async (block) => {
        const events = parseBlockEvents(api, block);
        return await cb(events, block);
      });
    });
  } else if (block) {
    const events = parseBlockEvents(api, block);
    await cb(events, block);
    return tail(api, nr + 1, cb);
  }
};

/**
 *
 * Extracts the relevant game events from the block extrinsics
 *
 * @param api ApiProise
 * @param block SignedBlock
 * @returns Event[]
 */
export const parseBlockEvents = (
  api: ApiPromise,
  block: SignedBlock
): Event[] => {
  const blockjson: any = block.toJSON();
  const events = blockjson.block.extrinsics
    .map((ex: string) => {
      const tx = api.tx(ex);
      const txjson: any = tx.toHuman();

      if (!txjson.isSigned) return null;

      if (txjson.method.method == "remark") {
        const signer = txjson.signer.Id;
        try {
          const json = JSON.parse(txjson.method.args.remark);
          if (json && "type" in json) {
            if (json.type === "turn") {
              return {
                ...json,
                turn: {
                  ...json.turn,
                  blockNumber: blockNumberOf(block),
                  player: signer,
                },
              };
            }
            return json;
          }
        } catch (error) {
          return null;
        }
      }

      if (txjson.method.method === "createCpmmMarketAndDeployAssets") {
        return { type: "newgame", market: txjson.method.args };
      }

      return null;
    })
    .filter((event: object | null): event is Event =>
      Boolean(event && "type" in event)
    );

  return events;
};
