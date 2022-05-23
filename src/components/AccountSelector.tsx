import { useStore } from '@nanostores/solid'
import { Component, For, JSX, Show } from 'solid-js'
import {
  Box,
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
import { Identicon } from './Identicon'

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
        <Show when={selected()}>
          <Box mr={8}>
            <Identicon address={selected()} size={22} />
          </Box>
        </Show>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectListbox>
          <For each={accounts()}>
            {item => (
              <SelectOption value={item.address}>
                <Identicon address={item.address} size={22} />
                <SelectOptionText>
                  {item.name ? `${item.name}: ` : ''}
                  {item.address}
                </SelectOptionText>
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
