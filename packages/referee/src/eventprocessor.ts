import SDK from "@zeitgeistpm/sdk";
import { Db } from "mongodb";
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from "@zeitgeistpm/sdk/dist/types";
import * as GS from "@tick-tack-block/gamelogic/src/gamestate";
import * as GB from "@tick-tack-block/gamelogic/src/gameboard";
import * as Blockcursor from "./model/blockcursor";
import * as Game from "./model/game";
import { tail } from "./events";
import { blockNumberOf } from "./util/substrate";
import { readMultiHash } from "./util/ipfs";

export const process = async (db: Db, sdk: SDK) => {
  const cursor = await Blockcursor.get(db, sdk);

  await tail(sdk, cursor, async (events, block) => {
    const blockNumber = blockNumberOf(block);

    for (const event of events) {
      switch (event.type) {
        case "newgame":
          const metadata: DecodedMarketMetadata & {
            categories: CategoryMetadata;
          } = JSON.parse(await readMultiHash(event.market.metadata));

          const newgame: GS.FreshGame = {
            type: "fresh",
            players: {
              challenger: metadata.categories[0].name,
              challenged: metadata.categories[1].name,
            },
            state: GB.empty(),
            events: [`${blockNumber}: FIGHT!`],
          };

          console.log(blockNumber, "new game", metadata.slug);
          console.log(newgame);

          await Game.put(
            db,
            metadata.slug,
            event.market.marketId,
            newgame,
            true
          );

          break;

        case "turn":
          const game = await Game.get(db, event.slug);

          if (game) {
            const nextstate = GS.turn(game.state, event.turn);

            console.log(blockNumber, "turn", event.slug);
            console.log(nextstate);

            await Game.put(db, event.slug, game.marketId, nextstate, false);
          }
          break;
      }
    }

    await Blockcursor.update(db, blockNumber);
  });
};
