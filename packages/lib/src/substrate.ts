import { ApiPromise } from "@polkadot/api";
import { VoidFn } from "@polkadot/api/types";
import { SignedBlock } from "@polkadot/types/interfaces";

/**
 *
 * Tails the chain for new blocks from a given blocknumber
 *
 * @param api ApiPromise
 * @param nr number - block number to tail from
 * @param cb function - callback to invoke on new block
 * @returns function? - unsubscribe
 */
export const tail = async (
  api: ApiPromise,
  nr: number,
  cb: (block: SignedBlock) => Promise<void>
): Promise<VoidFn | undefined> => {
  const [block, last] = await blockAt(api, nr);

  if (last) {
    return await api.rpc.chain.subscribeFinalizedHeads((header) => {
      return api.rpc.chain.getBlock(header.hash).then(async (block) => {
        return await cb(block);
      });
    });
  } else if (block) {
    await cb(block);
    return tail(api, nr + 1, cb);
  }
};

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
