import { Db } from "mongodb";
import SDK from "@zeitgeistpm/sdk";
import {
  DecodedMarketMetadata,
  CategoryMetadata,
} from "@zeitgeistpm/sdk/dist/types";
import { blockNumberOf, readMultiHash } from "@tick-tack-block/lib";
import * as GameState from "@tick-tack-block/gamelogic/src/gamestate";
import * as Blockcursor from "./model/blockcursor";
import * as GameAggregate from "./model/game/aggregate";
import * as GameEvents from "./model/game/events";

export const process = async (db: Db, sdk: SDK) => {
  const cursor = await Blockcursor.get(db, sdk);

  await GameEvents.tail(sdk, cursor, async (events, block) => {
    const blockNumber = blockNumberOf(block);

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

    await Blockcursor.update(db, blockNumber);
  });
};
