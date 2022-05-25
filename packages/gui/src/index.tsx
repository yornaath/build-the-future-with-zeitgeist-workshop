/* @refresh reload */

import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { chakraTheme } from './theme'
import App from './App'

const rootElement = document.getElementById('root')

const queryClient = new QueryClient()

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={chakraTheme}>
          <App />
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}
