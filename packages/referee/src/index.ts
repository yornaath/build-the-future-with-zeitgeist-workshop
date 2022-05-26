import SDK from "@zeitgeistpm/sdk";
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from "@zeitgeistpm/sdk/dist/types";
import * as GS from "@tick-tack-block/gamelogic/src/gamestate";
import * as GB from "@tick-tack-block/gamelogic/src/gameboard";
import * as DB from "./model/db";
import * as blockcursor from "./model/blockcursor";
import * as game from "./model/game";
import { tail } from "./events";
import { blockNumberOf } from "./util/substrate";
import { readMultiHash } from "./util/ipfs";

const main = async () => {
  const [db, client] = await DB.connect();
  const sdk = await SDK.initialize();

  const cursor = 1334180; // await blockcursor.cursor(db, sdk);

  await tail(sdk.api, cursor, async (events, block) => {
    const blockNumber = blockNumberOf(block);

    for (const event of events) {
      switch (event.type) {
        case "newgame":
          const metadata: DecodedMarketMetadata & {
            categories: CategoryMetadata;
          } = JSON.parse(await readMultiHash(event.market.metadata.Sha3_384));

          const newgame: GS.FreshGame = {
            type: "fresh",
            players: {
              challenger: metadata.categories[0].name,
              challenged: metadata.categories[1].name,
            },
            state: GB.empty(),
            events: ["FIGHT!"],
          };

          console.log("new game", metadata.slug);
          console.log(newgame);

          await game.put(db, metadata.slug, newgame, true);

          break;

        case "turn":
          const existingGame = await game.get(db, event.slug);
          if (existingGame) {
            const nextstate = GS.turn(existingGame.state, event.turn);
            console.log("turn", event.slug);
            console.log(nextstate);
            await game.put(db, event.slug, nextstate, false);
          }
          break;
      }
    }

    await blockcursor.update(db, blockNumber);
  });
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
