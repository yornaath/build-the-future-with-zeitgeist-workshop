import { useStore } from '@nanostores/solid'
import { Component, For } from 'solid-js'
import { Box } from '@hope-ui/solid'
import { $sdk } from './state/sdk'
import { $accounts } from './state/account'
import AccountSelector from './components/AccountSelector'

const App: Component = () => {
  const sdk = useStore($sdk)
  return (
    <Box>
      <AccountSelector />
    </Box>
  )
}

export default App
