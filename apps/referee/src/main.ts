import SDK from "@zeitgeistpm/sdk";
import * as DB from "./db";
import * as GameAggregator from "./model/game/aggregator";
import * as api from "./api";

const main = async () => {
  const [db] = await DB.connect();
  const sdk = await SDK.initialize();

  GameAggregator.run(db, sdk);

  api.serve(db, sdk);
};

main();
