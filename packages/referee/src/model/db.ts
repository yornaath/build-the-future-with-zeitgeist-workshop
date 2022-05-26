import { Db, MongoClient, ClientSession } from "mongodb";

const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_DATABASE,
  MONGODB_HOST,
  MONGODB_DOCKER_PORT,
} = process.env;

let db: Db;
const uri = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_DOCKER_PORT}/?authSource=admin`;
const client = new MongoClient(uri);

export const connect = async (): Promise<[Db, MongoClient]> => {
  if (!db) {
    const connection = await client.connect();
    db = connection.db(MONGODB_DATABASE);
  }

  return [db, client];
};

export const transactionOptions = {
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
  readPreference: "primary",
};
