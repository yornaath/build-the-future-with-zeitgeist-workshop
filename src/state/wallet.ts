import { atom, onMount, task, map } from 'nanostores'
import { uniqBy, prop } from 'ramda'
import { persistentAtom } from '@nanostores/persistent'
import { encodeAddress } from '@polkadot/keyring'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { web3Enable } from '@polkadot/extension-dapp'
import SDK from '@zeitgeistpm/sdk'

export const $loaded = atom(false)

export const $sdk = atom<SDK | null>(null)
export const $accounts = atom<InjectedAccount[]>([])
export const $selectedAccount = persistentAtom<string>('')

task(async () => {
  const [sdk, extensions] = await Promise.all([SDK.initialize(), web3Enable('zeitgeist-workshop')])
  const [consts, accounts] = await Promise.all([
    sdk.api.consts,
    Promise.all(extensions.map(extension => extension.accounts.get())),
  ])
  const ss58Format = Number(consts.system.ss58Prefix.toString())
  const uniqueAccounts = uniqBy(prop('address'), accounts.flat()).map(account => ({
    ...account,
    address: encodeAddress(account.address, ss58Format),
  }))
  $sdk.set(sdk)
  $accounts.set(uniqueAccounts)
  $loaded.set(true)
})

export const selectAccount = (account: InjectedAccount) => {
  $selectedAccount.set(account.address)
}
