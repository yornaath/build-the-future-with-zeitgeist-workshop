import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { IoIosClose } from 'react-icons/io'
import { BiCircle } from 'react-icons/bi'
import * as GS from '@tick-tack-block/gamelogic/src/gamestate'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'

export type GameBoardProps = {
  game: GS.GameState
  size: number
  onClick: (coord: GB.Coordinate) => void
}

export const GameBoard = (props: GameBoardProps) => {
  return (
    <Box>
      <Box mb={2} mt={-2} ml={-2}>
        {props.game.state.map((row, y) => (
          <Flex key={y} w="fit-content">
            {row.map((slot, x) => (
              <Box key={x} h={props.size} w={props.size} p={2}>
                <Flex
                  justifyContent={'center'}
                  alignItems="center"
                  onClick={() => props.onClick([x as GB.SlotRange, y as GB.SlotRange])}
                  cursor={'pointer'}
                  background="blackAlpha.200"
                  rounded={'md'}
                  h="full"
                  w="full">
                  {slot == 'x' ? (
                    <IoIosClose color="#1a1a1a" size={120} />
                  ) : slot === 'o' ? (
                    <BiCircle color="#ac2dba" size={44} />
                  ) : (
                    ''
                  )}
                </Flex>
              </Box>
            ))}
          </Flex>
        ))}
      </Box>
      <Text>
        <b>Next turn:</b> {props.game.players[GS.getPlayerTurn(props.game)]}
      </Text>
    </Box>
  )
}
