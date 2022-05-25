import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'

export const isValid = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

export const shortenAddress = (
  address: string,
  sliceStart: number = 6,
  sliceEnd: number = 4,
) => {
  return `${address.slice(0, sliceStart)}...${address.slice(-sliceEnd)}`
}

export const lastFour = (address: string) => address.slice(-4)
