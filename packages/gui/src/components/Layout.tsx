import { Box, Container, Flex, Text } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import AccountSelector from './AccountSelector'

export const Layout = () => {
  return (
    <Box>
      <main>
        <Container maxW="2xl" pt={12}>
          <Box textAlign={'center'} mb={12}>
            <Text display={'inline'} fontSize={32} fontWeight="bold">
              Tick-Tack...
            </Text>
            <Text
              display={'inline'}
              color="seer.600"
              fontSize={32}
              fontFamily="'Condiment', cursive;">
              ZEITGEIST!
            </Text>
          </Box>
          <Outlet />
        </Container>
        <Flex w="full" justifyContent={'center'} position={'fixed'} bottom="4" left="4">
          <AccountSelector />
        </Flex>
      </main>
    </Box>
  )
}
