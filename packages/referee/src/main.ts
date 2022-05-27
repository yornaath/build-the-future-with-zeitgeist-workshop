import SDK from "@zeitgeistpm/sdk";
import * as DB from "./model/db";
import * as eventprocessor from "./eventprocessor";
import * as api from "./api";

const main = async () => {
  const [db, client] = await DB.connect();
  const sdk = await SDK.initialize();
  eventprocessor.process(db, sdk);
  api.serve(db, sdk);
};

main();
