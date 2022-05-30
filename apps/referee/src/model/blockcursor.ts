import { Db, ClientSession } from "mongodb";
import SDK from "@zeitgeistpm/sdk";
import { blockNumberOf, latestBlock } from "@tick-tack-block/lib";

/**
 *
 * Get the last processes block.
 *
 * @param db mongodb.DB
 * @param sdk @zeitgeist.pm/SDK
 * @returns number
 */

export const get = async (db: Db, sdk: SDK) => {
  const lastProcessedBlock = await db
    .collection("blockcursor")
    .findOne({ key: "blockcursor" });

  let cursor: number;

  if (lastProcessedBlock) {
    cursor = lastProcessedBlock.number;
  } else {
    const currentBlock = await latestBlock(sdk.api);
    const currentBlockNumber = blockNumberOf(currentBlock);
    cursor = currentBlockNumber;
  }

  return cursor;
};

/**
 *
 * Set the processes block cursor.
 *
 * @param db mongodb.DB
 * @param blockNumber number
 * @param session mongodb.ClientSession - for transactions. Unimplemented
 */
export const update = async (
  db: Db,
  blockNumber: number,
  session?: ClientSession
) => {
  await db
    .collection("blockcursor")
    .findOneAndUpdate(
      { key: "blockcursor" },
      { $set: { number: blockNumber } },
      { upsert: true, session }
    );
};
