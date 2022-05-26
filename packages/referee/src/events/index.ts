import { ApiPromise } from "@polkadot/api";
import { VoidFn } from "@polkadot/api/types";
import { SignedBlock } from "@polkadot/types/interfaces";
import * as GS from "@tick-tack-block/gamelogic/src/gamestate";
import { blockAt } from "../util/substrate";

export type Event =
  | { type: "newgame"; market: any }
  | { type: "turn"; slug: string; turn: GS.Turn };

export const tail = async (
  api: ApiPromise,
  nr: number,
  cb: (events: Event[], block: SignedBlock) => Promise<void>
): Promise<VoidFn> => {
  const [block, last] = await blockAt(api, nr);
  if (last) {
    const unsub = await api.rpc.chain.subscribeFinalizedHeads((header) => {
      console.log("tailed");
      return api.rpc.chain.getBlock(header.hash).then(async (block) => {
        const events = findBlockEvents(api, block);
        return await cb(events, block);
      });
    });
    return unsub;
  } else if (block) {
    const events = findBlockEvents(api, block);
    await cb(events, block);
    return tail(api, nr + 1, cb);
  }
  return () => null;
};

export const findBlockEvents = (
  api: ApiPromise,
  block: SignedBlock
): Event[] => {
  const blockjson: any = block.toJSON();
  const events = blockjson.block.extrinsics
    .map((ex: string) => {
      const tx = api.tx(ex);
      const txjson: any = tx.toHuman();

      if (txjson.isSigned && txjson.method.method == "remark") {
        const signer = txjson.signer.Id;
        try {
          const json = JSON.parse(txjson.method.args.remark);
          if (json && "type" in json) {
            if (json.type === "turn") {
              return {
                ...json,
                turn: {
                  ...json.turn,
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

      if (
        txjson.isSigned &&
        txjson.method.method === "createCpmmMarketAndDeployAssets"
      ) {
        return { type: "newgame", market: txjson.method.args };
      }

      return null;
    })
    .filter((event: object | null): event is Event =>
      Boolean(event && "type" in event)
    );

  return events;
};
