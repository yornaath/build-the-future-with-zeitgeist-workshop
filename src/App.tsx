import React from 'react'
import { useStore } from '@nanostores/react'
import { Box, Container, Flex, Spinner } from '@chakra-ui/react'
import AccountSelector from './components/AccountSelector'
import { $loaded, $sdk, $selectedAccount } from './state/wallet'

const App = () => {
  const loaded = useStore($loaded)

  return !loaded ? (
    <Box position={'fixed'} display={'flex'} h="100%" w="100%" alignItems="center" justifyContent="center">
      <Spinner />
    </Box>
  ) : (
    <Box position={'fixed'} bottom="4" left="4" w="md">
      <AccountSelector />
    </Box>
  )
}

export default App
