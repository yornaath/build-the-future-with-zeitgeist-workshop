import { Box, Container } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import AccountSelector from './AccountSelector'

export const Layout = () => {
  return (
    <Box>
      <main>
        <Container maxW="6xl">
          <Outlet />
        </Container>
        <Box position={'fixed'} bottom="4" left="4">
          <AccountSelector />
        </Box>
      </main>
    </Box>
  )
}
