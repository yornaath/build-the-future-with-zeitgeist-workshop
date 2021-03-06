import { Box, Container, Flex, Image, Text } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import AccountSelector from './AccountSelector'
import { GameList } from './GameList'
import { NewGameButton } from './NewGameButton'

export const Layout = () => {
  return (
    <>
      <Container maxW="2xl" pt={12} h={'full'}>
        <Flex alignContent="center" alignItems="center" justifyContent="center" mb={12}>
          <Image w={10} h={10} mr={3} src="/zeitgeist.png" />
          <Text display={'inline'} fontSize={32} fontWeight="bold" pt={1}>
            Tick-Tack...
            <Text
              display={'inline'}
              color="seer.600"
              fontSize={32}
              fontFamily="'Condiment', cursive;">
              ZEITGEIST!
            </Text>
          </Text>
        </Flex>
        <Outlet />
      </Container>
      <Flex w="full" justifyContent={'center'} position={'fixed'} bottom="4" left="4">
        <Box>
          <Flex justifyContent={'center'} alignItems="center" mb={4}>
            <Box mr={4}>
              <AccountSelector />
            </Box>
            <NewGameButton />
          </Flex>
        </Box>
      </Flex>
      <Box position={'fixed'} right="0" top="0" bottom={0} w={'sm'}>
        <GameList />
      </Box>
    </>
  )
}
