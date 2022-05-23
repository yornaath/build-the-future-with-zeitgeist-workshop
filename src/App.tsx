import { allTasks } from 'nanostores'
import { useStore } from '@nanostores/solid'
import { Component, For, Show, createSignal, createEffect } from 'solid-js'
import { Box, Container, Spinner } from '@hope-ui/solid'
import AccountSelector from './components/AccountSelector'
import { $loaded } from './state/wallet'

const App: Component = () => {
  const loaded = useStore($loaded)

  return (
    <Container mt={20}>
      <Show
        when={loaded()}
        fallback={
          <Box display={'flex'} m={88} justifyContent="center">
            <Spinner />
          </Box>
        }>
        <AccountSelector />
      </Show>
    </Container>
  )
}

export default App
