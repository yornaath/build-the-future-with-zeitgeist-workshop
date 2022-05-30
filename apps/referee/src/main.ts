import SDK from "@zeitgeistpm/sdk";
import * as DB from "./db";
import * as eventprocessor from "./eventprocessor";
import * as api from "./api";

const main = async () => {
  const [db] = await DB.connect();
  const sdk = await SDK.initialize();

  api.serve(db, sdk);
  eventprocessor.process(db, sdk);
};

main();
