import SDK from "@zeitgeistpm/sdk";
import {} from "@tick-tack-block/gamelogic";
import { blockNumberOf, latestBlock, tailRemarks } from "@tick-tack-block/lib";
import * as DB from "./db";
import * as blockcursor from "./blockcursor";

const main = async () => {
  const [db, client] = await DB.connect();
  const sdk = await SDK.initialize();

  const cursor = await blockcursor.cursor(db, sdk);

  tailRemarks(sdk.api, cursor, async (remarks, block) => {
    const blockNumber = blockNumberOf(block);
    await blockcursor.update(db, blockNumber);
  });
};

main();
