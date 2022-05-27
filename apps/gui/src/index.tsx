/* @refresh reload */

import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { Global } from '@emotion/react'
import * as ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { chakraTheme } from './theme'
import App from './App'

const rootElement = document.getElementById('root')

const queryClient = new QueryClient()

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Global
        styles={`
        @import url('https://fonts.googleapis.com/css2?family=Condiment&display=swap');
      `}
      />
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={chakraTheme}>
          <App />
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}
