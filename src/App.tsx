import React from 'react'
import { useStore } from '@nanostores/react'
import { Box, Container, Flex, Spinner } from '@chakra-ui/react'
import AccountSelector from './components/AccountSelector'
import { $loaded, $sdk, $selectedAccount } from './state/wallet'

const App = () => {
  const loaded = useStore($loaded)

  return (
    <Box maxW={'container.sm'}>
      {!loaded ? (
        <Box display={'flex'} m={88} justifyContent="center">
          <Spinner />
        </Box>
      ) : (
        <Box position={'fixed'} bottom="4" left="4" w="md">
          <AccountSelector />
        </Box>
      )}
    </Box>
  )
}

export default App
