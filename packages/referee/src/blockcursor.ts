import { Db, ClientSession } from "mongodb";
import SDK from "@zeitgeistpm/sdk";
import { blockNumberOf, latestBlock } from "@tick-tack-block/lib";

export const cursor = async (db: Db, sdk: SDK) => {
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
