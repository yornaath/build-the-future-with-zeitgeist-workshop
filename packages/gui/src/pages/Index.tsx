import { Box, Button, Flex } from '@chakra-ui/react'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import { NewGameButton } from '../components/NewGameButton'
import { GameBoard } from '../components/GameBoard'

export const IndexPage = () => {
  const onClickSlot = (coord: GB.Coordinate) => {
    console.log(coord)
  }

  return (
    <Box>
      <Flex justifyContent={'center'} mb={28}>
        <GameBoard
          size={28}
          onClick={onClickSlot}
          game={{
            type: 'progressing',
            players: {
              challenged: 'fooooo',
              challenger: 'baaaar',
            },
            state: [
              [null, 'o', null],
              ['o', 'x', 'o'],
              ['x', 'x', 'o'],
            ],
            events: [],
          }}
        />
      </Flex>

      <Flex justifyContent={'center'}>
        <NewGameButton />
      </Flex>
    </Box>
  )
}
