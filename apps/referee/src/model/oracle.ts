import { Keyring } from '@polkadot/keyring'

/**
 * The Oracle Account KeyringPair used by the referee.
 */

const keyring = new Keyring()

const seed = JSON.parse(process.env.WORKSHOP_ORACLE_SEED as string)
const pass = process.env.WORKSHOP_ORACLE_PASSPHRASE as string

const pair = keyring.addFromJson(seed)

pair.unlock(pass)

export default pair
