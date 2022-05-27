import { Db } from "mongodb";

import * as GS from "@tick-tack-block/gamelogic/src/gamestate";

export type Game = {
  marketId: string;
  slug: string;
  state: GS.GameState;
};

export const get = async (db: Db, slug: string): Promise<Game | null> => {
  return await db.collection("games").findOne<any>({ slug });
};

export const put = async (
  db: Db,
  slug: string,
  marketId: string,
  game: GS.GameState,
  upsert: boolean
) => {
  return db.collection<Game>("games").findOneAndReplace(
    { slug },
    {
      marketId,
      slug,
      state: game,
    },
    { upsert }
  );
};

export const list = async (db: Db) => {
  return db.collection<Game>("games").find().toArray();
};
