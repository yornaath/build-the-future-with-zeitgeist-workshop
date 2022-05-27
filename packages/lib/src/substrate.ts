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
