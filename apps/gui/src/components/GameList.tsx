import ms from 'ms'
import React from 'react'
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'
import { Link, NavLink } from 'react-router-dom'
import { useQuery } from 'react-query'
import type { GameAggregate } from '@tick-tack-block/referee/src/model/game/game'
import { useStore } from '@nanostores/react'
import * as wallet from '../state/wallet'
import { shortenAddress } from '@tick-tack-block/lib'

export const GameList = () => {
  const games = useQuery<GameAggregate[]>(
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
      {games.data?.length && (
        <Box mb={4}>
          <Text textAlign="right" fontWeight={'bold'} fontSize="xl">
            Games
          </Text>
        </Box>
      )}

      {games.data?.map(game => (
        <NavLink to={`/games/${game.slug}`}>
          {({ isActive }) => <GameItem game={game} isActive={isActive} />}
        </NavLink>
      ))}
    </Box>
  )
}

const GameItem = (props: { game: GameAggregate; isActive: boolean }) => {
  const selected = useStore(wallet.$selectedAccount)
  const { challenged, challenger } = props.game.state.players

  const isParticipating = challenger == selected || challenged == selected

  return (
    <Box
      backgroundColor={props.isActive ? 'seer.200' : 'blackAlpha.200'}
      color={props.isActive ? 'whiteAlpha.800' : 'blackAlpha.800'}
      rounded="md"
      py={3}
      px={4}
      mb={3}
      borderWidth={2}
      borderColor={isParticipating ? 'seer.100' : 'blackAlpha.200'}
      borderStyle="solid"
      cursor={'pointer'}>
      <Box>
        <Tooltip
          hasArrow
          bg="seer.500"
          label={isParticipating ? 'You have been challenged!' : undefined}>
          <Flex>
            <Text size={'xs'} mr={2}>
              {shortenAddress(challenger)}
            </Text>
            <b>{' VS '}</b>
            <Text size={'xs'} ml={2}>
              {shortenAddress(challenged)}
            </Text>
          </Flex>
        </Tooltip>
      </Box>
    </Box>
  )
}
