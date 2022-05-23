import { atom, onMount } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'
import { uniqBy, prop } from 'ramda'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { web3Enable } from '@polkadot/extension-dapp'

export const $accounts = atom<InjectedAccount[]>([])
export const $selectedAccount = persistentAtom<string>('')

onMount($accounts, () => {
  web3Enable('zeitgeist-workshop').then(async extensions => {
    const accounts = await Promise.all(extensions.map(extension => extension.accounts.get()))
    const uniqueAccounts = uniqBy(prop('address'), accounts.flat())
    $accounts.set(uniqueAccounts)
  })
})

export const selectAccount = (account: InjectedAccount) => {
  $selectedAccount.set(account.address)
}
// });
