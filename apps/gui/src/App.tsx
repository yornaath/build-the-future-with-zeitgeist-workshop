import React from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as wallet from './state/wallet'
import { IndexPage } from './pages/Index'
import { Layout } from './components/Layout'
import { GamePage } from './pages/Game'
import { Global } from '@emotion/react'

const App = () => {
  const loaded = useStore(wallet.$loaded)

  return (
    <>
      <Global
        styles={`
        html, body, #root {
          height: 100%;
        }
      `}
      />
      {!loaded ? (
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
              <Route path="/games/:slug" element={<GamePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
