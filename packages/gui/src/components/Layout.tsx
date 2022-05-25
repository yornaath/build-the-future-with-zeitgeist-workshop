import { Box, Container, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import AccountSelector from './AccountSelector'

export const Layout = () => {
  return (
    <Box>
      <main>
        <Container maxW="2xl" py={28}>
          <Outlet />
        </Container>
        <Flex w="full" justifyContent={'center'} position={'fixed'} bottom="4" left="4">
          <AccountSelector />
        </Flex>
      </main>
    </Box>
  )
}
