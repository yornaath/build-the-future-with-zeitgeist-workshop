import React from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import AccountSelector from './components/AccountSelector'
import * as wallet from './state/wallet'

const App = () => {
  const loaded = useStore(wallet.$loaded)

  return !loaded ? (
    <Box
      position={'fixed'}
      display={'flex'}
      h="100%"
      w="100%"
      alignItems="center"
      justifyContent="center">
      <Spinner />
    </Box>
  ) : (
    <Box position={'fixed'} bottom="4" left="4">
      <AccountSelector />
    </Box>
  )
}

export default App
