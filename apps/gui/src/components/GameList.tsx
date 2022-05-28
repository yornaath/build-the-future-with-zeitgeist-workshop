import ms from 'ms'
import React from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import type { Game } from '@tick-tack-block/referee/src/model/game'
import { useStore } from '@nanostores/react'
import * as wallet from '../state/wallet'
import { shortenAddress } from '@tick-tack-block/lib'

export const GameList = () => {
  const games = useQuery<Game[]>(
    'games',
    async () => {
      return fetch('http://localhost:3000/games').then(res => res.json())
    },
    {
      refetchInterval: ms('3 seconds'),
    },
  )

  return (
    <Box p={12}>
      {games.data?.map(game => (
        <Link to={`/games/${game.slug}`}>
          <GameItem game={game} />
        </Link>
      ))}
    </Box>
  )
}

const GameItem = (props: { game: Game }) => {
  const selected = useStore(wallet.$selectedAccount)
  const { challenged, challenger } = props.game.state.players

  const isParticipating = challenger == selected || challenged == selected

  return (
    <Box
      backgroundColor={'blackAlpha.200'}
      rounded="md"
      py={3}
      px={4}
      mb={3}
      borderWidth={2}
      borderColor={isParticipating ? 'seer.100' : 'blackAlpha.200'}
      borderStyle="solid"
      cursor={'pointer'}>
      <Box>
        <Flex>
          <Text size={'xs'} mr={2}>
            {shortenAddress(challenger)}
          </Text>
          <b>{' VS '}</b>
          <Text size={'xs'} ml={2}>
            {shortenAddress(challenged)}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
