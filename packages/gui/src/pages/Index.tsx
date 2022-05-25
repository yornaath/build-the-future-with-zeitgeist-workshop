import { Box, Button } from '@chakra-ui/react'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import { NewGameButton } from '../components/NewGameButton'
import { GameBoard } from '../components/GameBoard'

export const IndexPage = () => {
  const onClickSlot = (coord: GB.Coordinate) => {
    console.log(coord)
  }

  return (
    <Box>
      <NewGameButton />
      <GameBoard
        size={24}
        onClick={onClickSlot}
        game={{
          type: 'progressing',
          players: {
            challenged: 'fooooo',
            challenger: 'baaaar',
          },
          state: [
            [null, 'o', null],
            [null, null, 'o'],
            ['x', 'x', null],
          ],
          events: [],
        }}
      />
    </Box>
  )
}
