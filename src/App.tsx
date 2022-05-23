import React from 'react'
import { useStore } from '@nanostores/react'
import { Box, Container, Flex, Spinner } from '@chakra-ui/react'
import AccountSelector from './components/AccountSelector'
import { $loaded, $sdk, $selectedAccount } from './state/wallet'

const App = () => {
  const loaded = useStore($loaded)

  return (
    <Container mt={20}>
      {!loaded ? (
        <Box display={'flex'} m={88} justifyContent="center">
          <Spinner />
        </Box>
      ) : (
        <Flex>
          <AccountSelector />
        </Flex>
      )}
    </Container>
  )
}

export default App
