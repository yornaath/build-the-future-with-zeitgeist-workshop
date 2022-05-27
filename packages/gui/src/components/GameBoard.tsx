import {
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { IoIosClose } from 'react-icons/io'
import { BiCircle } from 'react-icons/bi'
import { IoMdListBox } from 'react-icons/io'
import * as GS from '@tick-tack-block/gamelogic/src/gamestate'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import { shortenAddress } from '../lib/account'

export type GameBoardProps = {
  game: GS.GameState
  size: number
  onClick: (coord: GB.Coordinate) => void
}

export const GameBoard = (props: GameBoardProps) => {
  return (
    <Box>
      <Flex justifyContent={'center'}>
        <Box mb={2} mt={-2} ml={-2}>
          {props.game.state.map((row, y) => (
            <Flex key={y} w="fit-content">
              {row.map((slot, x) => (
                <Box key={x} h={props.size} w={props.size} p={2}>
                  <Flex
                    justifyContent={'center'}
                    alignItems="center"
                    onClick={() =>
                      props.onClick([x as GB.SlotRange, y as GB.SlotRange])
                    }
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
      </Flex>
      <Box>
        <Flex mb={2}>
          <Box flex="1">
            {props.game.type === 'finished' ? (
              <Text>
                <b>Winner:</b> {shortenAddress(props.game.winner)}
              </Text>
            ) : (
              <Text>
                <b>Next turn:</b>{' '}
                {shortenAddress(props.game.players[GS.getPlayerTurn(props.game)])}
              </Text>
            )}
          </Box>
          <Box justifySelf={'flex-end'} pr={2}>
            <Popover placement="right-end">
              <PopoverTrigger>
                <Box>
                  <IoMdListBox size="20" />
                </Box>
              </PopoverTrigger>
              <PopoverContent outlineColor={'none'} boxShadow="none">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>
                  <b>Events</b>
                </PopoverHeader>
                <PopoverBody>
                  {props.game.events.map(event => (
                    <Box mb={2}>
                      <Text fontSize={14}>{event}</Text>
                    </Box>
                  ))}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
        </Flex>
        <Box>
          <Flex alignItems={'center'}>
            <b>Challenger:</b> {shortenAddress(props.game.players.challenger)}
            <Tooltip label="This players turn.">
              {GS.getPlayerTurn(props.game) === 'challenger' ? (
                <Box ml={2} background={'seer.500'} h="3" w="3" rounded={'full'} />
              ) : (
                ''
              )}
            </Tooltip>
          </Flex>
          <Flex alignItems={'center'}>
            <b>Challenged: </b> {shortenAddress(props.game.players.challenged)}
            <Tooltip label="This players turn.">
              {GS.getPlayerTurn(props.game) === 'challenged' ? (
                <Box ml={2} background={'seer.500'} h="3" w="3" rounded={'full'} />
              ) : (
                ''
              )}
            </Tooltip>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
