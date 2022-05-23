import { useStore } from '@nanostores/react'
import { Select, Flex, Box, Text } from '@chakra-ui/react'
import Identicon from '@polkadot/react-identicon'
import { useQuery } from 'react-query'
import { $accounts, $sdk, $selectedAccount, selectAccount } from '../state/wallet'

const AccountSelector = () => {
  const sdk = useStore($sdk)
  const selected = useStore($selectedAccount)
  const accounts = useStore($accounts)

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
    const account = accounts.find(account => account.address === event.target.value)
    if (account) {
      selectAccount(account)
    }
  }

  const balance = useQuery<number>(
    'balance',
    async () => {
      return sdk?.api.query.system
        .account(selected)
        .then(data => data.toJSON())
        .then((json: any) => json.data.free / 10 ** 10)
    },
    { enabled: Boolean(sdk && selected) },
  )

  return (
    <Box display={'inline-flex'} justifyContent="center" background="blackAlpha.100" rounded={'md'}>
      <Flex justifyContent="center" filter={!selected ? 'grayscale(1)' : ''} py={2} px={4}>
        <Identicon
          value={selected || 'dE2cVL9QAgh3MZEK3ZhPG5S2YSqZET8V1Qa36epaU4pQG4pd8'}
          size={36}
          theme="polkadot"
        />
      </Flex>
      <Select
        w="sm"
        py={2}
        px={4}
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

      <Flex
        py={2}
        px={4}
        w="150px"
        alignItems="center"
        justify={'flex-end'}
        alignContent="center"
        roundedBottomRight={'md'}
        roundedTopRight={'md'}
        textAlign="center"
        backgroundColor="blackAlpha.100">
        {selected ? (
          <>
            <Text mr={1} color="blue.500">
              {balance.data?.toFixed(4)}
            </Text>{' '}
            <Text fontWeight="bold">ZBS</Text>
          </>
        ) : (
          <Text flex="1">--</Text>
        )}
      </Flex>
    </Box>
  )
}

export default AccountSelector
