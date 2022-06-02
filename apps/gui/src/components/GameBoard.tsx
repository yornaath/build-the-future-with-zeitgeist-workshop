import {
  Box,
  Button,
  Flex,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Progress,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { shortenAddress, slice } from '@tick-tack-block/lib'
import { AiOutlineAudit } from 'react-icons/ai'
import { IoIosClose } from 'react-icons/io'
import { BiCircle } from 'react-icons/bi'
import { IoMdListBox } from 'react-icons/io'
import * as GS from '@tick-tack-block/gamelogic/src/gamestate'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import * as GameAggregate from '@tick-tack-block/referee/src/model/game/game'
import { aggregate } from '@tick-tack-block/referee/src/model/game/aggregator'
import { useStore } from '@nanostores/react'
import * as wallet from '../state/wallet'
import { useState } from 'react'

export type GameBoardProps = {
  game: GS.GameState
  size: number
  onClick: (coord: GB.Coordinate) => void
}

export const GameBoard = (props: GameBoardProps) => {
  const selectedAccount = useStore(wallet.$selectedAccount)

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
                      <IoIosClose
                        color={
                          selectedAccount === props.game.players.challenger
                            ? '#ac2dba'
                            : '#1a1a1a'
                        }
                        size={120}
                      />
                    ) : slot === 'o' ? (
                      <BiCircle
                        color={
                          selectedAccount === props.game.players.challenged
                            ? '#ac2dba'
                            : '#1a1a1a'
                        }
                        size={44}
                      />
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
              <PopoverContent
                backgroundColor={'rgb(30,30,30)'}
                color={'white'}
                _focus={{ boxShadow: 'none' }}>
                <PopoverArrow backgroundColor={'blackAlpha.800'} />
                <PopoverCloseButton />
                <PopoverHeader>
                  <b>Events</b>
                </PopoverHeader>
                <PopoverBody>
                  <EventsList game={props.game} />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
        </Flex>
        <Box>
          <Flex alignItems={'center'}>
            <Text fontWeight={'bold'} flex={1}>
              Challenger(<b>X</b>):
            </Text>
            <Tooltip
              backgroundColor={
                selectedAccount === props.game.players.challenger
                  ? 'seer.500'
                  : 'gray.800'
              }
              label={
                selectedAccount === props.game.players.challenger
                  ? 'Your turn!'
                  : 'Other players turn'
              }>
              {GS.getPlayerTurn(props.game) === 'challenger' ? (
                <Box
                  mr={2}
                  background={
                    selectedAccount === props.game.players.challenger
                      ? '#ac2dba'
                      : '#1a1a1a'
                  }
                  h="3"
                  w="3"
                  rounded={'full'}
                />
              ) : (
                ''
              )}
            </Tooltip>
            {shortenAddress(props.game.players.challenger)}
          </Flex>
          <Flex alignItems={'center'}>
            <Text fontWeight={'bold'} flex={1}>
              Challenged(<b>O</b>):{' '}
            </Text>
            <Tooltip
              backgroundColor={
                selectedAccount === props.game.players.challenged
                  ? 'seer.500'
                  : 'gray.800'
              }
              label={
                selectedAccount === props.game.players.challenged
                  ? 'Your turn'
                  : 'Other players turn'
              }>
              {GS.getPlayerTurn(props.game) === 'challenged' ? (
                <Box
                  mr={2}
                  background={
                    selectedAccount === props.game.players.challenged
                      ? '#ac2dba'
                      : '#1a1a1a'
                  }
                  h="3"
                  w="3"
                  rounded={'full'}
                />
              ) : (
                ''
              )}
            </Tooltip>
            {shortenAddress(props.game.players.challenged)}
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

const EventsList = (props: { game: GS.GameState }) => {
  const sdk = useStore(wallet.$sdk)

  const [auditFetchProgress, setAuditFetchProgress] = useState(0)

  const onClickAudit = async () => {
    const start = props.game.events[0].blockNumber
    const end = props.game.events[props.game.events.length - 1].blockNumber
    const blocks = await slice(sdk.api, start, end, setAuditFetchProgress)
    let aggregates = GameAggregate.memory({})
    for (const block of blocks) {
      await aggregate(sdk, aggregates, block)
    }
    console.log(await aggregates.list())
    setAuditFetchProgress(0)
  }

  return (
    <>
      <Box mb="4">
        {props.game.events.map(event => (
          <Link
            target={'_blank'}
            href={`https://polkadot.js.org/apps/?rpc=${
              import.meta.env.VITE_ZEITGEIST_WS
            }/#/explorer/query/${event.blockNumber}`}>
            <Box mb={2}>
              <Text fontSize={14}>
                {event.blockNumber}: {event.event}
              </Text>
            </Box>
          </Link>
        ))}
      </Box>
      <Flex alignItems="center">
        <Box flex={1} mr={4} rounded="mb">
          {auditFetchProgress ? (
            <Flex justifyContent="flex-end" alignItems="center">
              <Text mr={2}>{auditFetchProgress.toFixed(0)}%</Text>
              <Spinner size={'sm'} />
            </Flex>
          ) : (
            ''
          )}
        </Box>
        <Button
          onClick={onClickAudit}
          rightIcon={<AiOutlineAudit />}
          colorScheme="seer"
          size={'xs'}
          float={'right'}>
          Audit
        </Button>
      </Flex>
    </>
  )
}
