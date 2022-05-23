import { useStore } from '@nanostores/react'
import { Select, Flex, Box } from '@chakra-ui/react'
import Identicon from '@polkadot/react-identicon'
import { $accounts, $selectedAccount, selectAccount } from '../state/wallet'

const AccountSelector = () => {
  const selected = useStore($selectedAccount)
  const accounts = useStore($accounts)

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
    const account = accounts.find(account => account.address === event.target.value)
    if (account) {
      selectAccount(account)
    }
  }

  return (
    <Box display={'inline-flex'} justifyContent="center" p={2} background="blackAlpha.100" rounded={'md'}>
      <Flex justifyContent="center" filter={!selected ? 'grayscale(1)' : ''}>
        <Identicon
          value={selected || 'dE2cVL9QAgh3MZEK3ZhPG5S2YSqZET8V1Qa36epaU4pQG4pd8'}
          size={36}
          theme="polkadot"
        />
      </Flex>
      <Select
        focusBorderColor="none"
        border="none"
        onChange={onChange}
        value={selected}
        placeholder="Select account">
        {accounts.map(account => (
          <option value={account.address}>
            {account.name ? `${account.name}: ` : ''}
            {account.address}
          </option>
        ))}
      </Select>
    </Box>
  )
}

export default AccountSelector
