import { ApiPromise } from "@polkadot/api";
import { SignedBlock } from "@polkadot/types/interfaces";

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

export const tailRemarks = async (
  api: ApiPromise,
  nr: number,
  cb: (remarks: string[], block: SignedBlock) => void
): Promise<void> => {
  const [block, last] = await blockAt(api, nr);
  if (last) {
    api.rpc.chain.subscribeFinalizedHeads((header) => {
      api.rpc.chain.getBlock(header.hash).then(async (block) => {
        const remarks = findBlockRemarks(api, block);
        return cb(remarks, block);
      });
    });
  } else if (block) {
    const remarks = findBlockRemarks(api, block);
    cb(remarks, block);
    return tailRemarks(api, nr + 1, cb);
  }
};

export const findBlockRemarks = (api: ApiPromise, block: SignedBlock) => {
  const blockjson: any = block.toJSON();
  const rmrks = blockjson.block.extrinsics
    .map((ex: string) => {
      const tx = api.tx(ex);
      const txjson: any = tx.toHuman();
      if (txjson.isSigned && txjson.method.method == "remark") {
        return txjson.method.args.remark as string;
      }
      return null;
    })
    .filter(
      (remark: string | null): remark is string => typeof remark === "string"
    );

  return rmrks;
};
