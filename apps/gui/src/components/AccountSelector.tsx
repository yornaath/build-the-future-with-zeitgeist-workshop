import { useQuery } from 'react-query'
import { useStore } from '@nanostores/react'
import { Select, Flex, Box, Text, Image } from '@chakra-ui/react'
import Identicon from '@polkadot/react-identicon'
import * as wallet from '../state/wallet'

const AccountSelector = () => {
  const sdk = useStore(wallet.$sdk)
  const selected = useStore(wallet.$selectedAccount)
  const accounts = useStore(wallet.$accounts)

  const balance = useQuery<number>(
    ['balance', selected],
    async () => {
      return sdk?.api.query.system
        .account(selected)
        .then(data => data.toJSON())
        .then((json: any) => json.data.free / 10 ** 10)
    },
    { enabled: Boolean(sdk && selected) },
  )

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
    const account = accounts.find(account => account.address === event.target.value)
    if (account) {
      wallet.selectAccount(account)
    }
  }

  return (
    <Box
      display={'inline-flex'}
      justifyContent="center"
      background="blackAlpha.100"
      rounded={'md'}>
      <Flex
        justifyContent="center"
        filter={!selected ? 'grayscale(1)' : ''}
        py={2}
        px={4}>
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
          <option key={account.address} value={account.address}>
            {account.name ? `${account.name}: ` : ''}
            {account.address}
          </option>
        ))}
      </Select>

      <Flex
        py={2}
        px={4}
        w="172px"
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
            <Image w={4} mx={1} src="/zeitgeist.png" />
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
