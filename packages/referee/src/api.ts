import fastify from "fastify";
import cors from "@fastify/cors";
import { Db } from "mongodb";
import SDK from "@zeitgeistpm/sdk";
import * as game from "./model/game";

export const serve = async (db: Db, sdk: SDK) => {
  const server = fastify();

  server.register(cors);

  server.get("/games", async () => {
    const games = await game.list(db);
    return games;
  });

  server.get("/games/:slug", async (req) => {
    const games = await game.get(db, (req.params as any).slug);
    return games;
  });

  await server.listen(
    parseInt(process.env.REFEREE_API_PORT as string),
    "0.0.0.0"
  );
  console.log("server up");
};
