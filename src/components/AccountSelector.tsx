import { useStore } from '@nanostores/solid'
import { Component, For, JSX } from 'solid-js'
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
} from '@hope-ui/solid'
import { $accounts, $selectedAccount, selectAccount } from '../state/account'

const AccountSelector: Component = () => {
  const selected = useStore($selectedAccount)
  const accounts = useStore($accounts)

  const onChange = (address: string) => {
    const account = accounts().find(account => account.address === address)
    if (account) {
      selectAccount(account)
    }
  }

  return (
    <Select onChange={onChange} value={selected()}>
      <SelectTrigger>
        <SelectPlaceholder>Select account</SelectPlaceholder>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectListbox>
          <For each={accounts()}>
            {item => (
              <SelectOption value={item.address}>
                <SelectOptionText>{item.address}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            )}
          </For>
        </SelectListbox>
      </SelectContent>
    </Select>
  )
}

export default AccountSelector
