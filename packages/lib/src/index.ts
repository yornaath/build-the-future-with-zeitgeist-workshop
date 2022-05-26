import { ApiPromise } from "@polkadot/api";
import { VoidFn } from "@polkadot/api/types";
import { SignedBlock } from "@polkadot/types/interfaces";
import { hexToString, u8aToString } from "@polkadot/util";
import { concat, toString } from "uint8arrays";
import CID from "cids";
import ipfsClient from "ipfs-http-client";
import all from "it-all";

export const blockNumberOf = (block: SignedBlock) => {
  return parseInt(block.block.header.number.toString().replace(/,/g, ""));
};

export const latestBlock = async (api: ApiPromise) => api.rpc.chain.getBlock();

export const blockAt = async (
  api: ApiPromise,
  nr: number
): Promise<[SignedBlock | null, boolean]> => {
  try {
    const block = await api.rpc.chain
      .getBlockHash(nr)
      .then((hash) => api.rpc.chain.getBlock(hash));
    return [block, false];
  } catch (error) {
    return [null, true];
  }
};

export const tail = async (
  api: ApiPromise,
  nr: number,
  cb: (remarks: string[], block: SignedBlock) => void
): Promise<VoidFn> => {
  const [block, last] = await blockAt(api, nr);
  if (last) {
    const unsub = await api.rpc.chain.subscribeFinalizedHeads((header) => {
      api.rpc.chain.getBlock(header.hash).then(async (block) => {
        const remarks = findBlockEvents(api, block);
        return cb(remarks, block);
      });
    });
    return unsub;
  } else if (block) {
    const remarks = findBlockEvents(api, block);
    cb(remarks, block);
    return tail(api, nr + 1, cb);
  }
  return () => null;
};

export const findBlockEvents = (api: ApiPromise, block: SignedBlock) => {
  const blockjson: any = block.toJSON();
  const rmrks = blockjson.block.extrinsics
    .map((ex: string) => {
      const tx = api.tx(ex);
      const txjson: any = tx.toHuman();

      if (txjson.isSigned && txjson.method.method == "remark") {
        return txjson.method.args.remark as string;
      }

      if (
        txjson.isSigned &&
        txjson.method.method === "createCpmmMarketAndDeployAssets"
      ) {
        return { type: "newgame", market: txjson.method.args };
      }

      return null;
    })
    .filter(
      (remark: string | null): remark is string => typeof remark === "string"
    );

  return rmrks;
};

export const readMultiHash = async (partialCid: string): Promise<string> => {
  const client = ipfsClient({
    url: "https://ipfs.zeitgeist.pm",
  });
  if (partialCid.slice(2, 6) !== "1530") {
    const str = hexToString(partialCid);
    return toString(concat(await all(client.cat(str))));
  }
  const cid = new CID("f0155" + partialCid.slice(2));
  const data = (await all(client.cat(cid))) as any[];
  return data.map(u8aToString).reduce((p, c) => p + c);
};
