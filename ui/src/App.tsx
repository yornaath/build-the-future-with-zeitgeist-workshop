import React from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as wallet from './state/wallet'
import { IndexPage } from './pages/Index'
import { Layout } from './components/Layout'

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
