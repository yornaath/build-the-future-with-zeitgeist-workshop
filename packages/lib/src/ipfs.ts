import { hexToString, u8aToString } from '@polkadot/util'
import { concat, toString } from 'uint8arrays'
import CID from 'cids'
import ipfsClient from 'ipfs-http-client'
import all from 'it-all'

export const readMultiHash = async (partialCid: string): Promise<string> => {
  const client = ipfsClient({
    url: 'https://ipfs.zeitgeist.pm',
  })
  if (partialCid.slice(2, 6) !== '1530') {
    const str = hexToString(partialCid)
    return toString(concat(await all(client.cat(str))))
  }
  const cid = new CID('f0155' + partialCid.slice(2))
  const data = (await all(client.cat(cid))) as any[]
  return data.map(u8aToString).reduce((p, c) => p + c)
}
