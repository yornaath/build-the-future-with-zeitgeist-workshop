import { Db } from "mongodb";
import SDK from "@zeitgeistpm/sdk";
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from "@zeitgeistpm/sdk/dist/types";
import { blockNumberOf, readMultiHash, tail } from "@tick-tack-block/lib";
import * as GameState from "@tick-tack-block/gamelogic/src/gamestate";
import * as Cursor from "../cursor";
import * as GameAggregate from "./game";
import * as GameEvents from "./events";

export const run = async (db: Db, sdk: SDK) => {
  const cursor = await Cursor.get(db, sdk, "games");

  return tail(sdk.api, cursor, async (block) => {
    const blockNumber = blockNumberOf(block);
    const events = await GameEvents.parseBlockEvents(sdk, block);

    for (const event of events) {
      switch (event.type) {
        case "newgame":
          const metadata: DecodedMarketMetadata & {
            categories: CategoryMetadata;
          } = JSON.parse(await readMultiHash(event.market.metadata));

          const newgame = GameState.create(blockNumber, {
            challenger: metadata.categories[0].name,
            challenged: metadata.categories[1].name,
          });

          await GameAggregate.put(
            db,
            metadata.slug,
            event.market.marketId,
            newgame,
            true
          );

          break;

        case "turn":
          const game = await GameAggregate.get(db, event.slug);

          if (game) {
            const nextstate = GameState.turn(game.state, event.turn);

            await GameAggregate.put(
              db,
              event.slug,
              game.marketId,
              nextstate,
              false
            );
          }

          break;
      }
    }

    await Cursor.update(db, "games", blockNumber);
  });
};
