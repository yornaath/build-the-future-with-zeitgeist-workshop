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
  useToast,
} from '@chakra-ui/react'
import hash from 'object-hash'
import { Repo, shortenAddress, slice } from '@tick-tack-block/lib'
import { BsPatchCheckFill } from 'react-icons/bs'
import { MdError } from 'react-icons/md'
import { AiOutlineAudit } from 'react-icons/ai'
import { IoIosClose } from 'react-icons/io'
import { BiCircle } from 'react-icons/bi'
import { IoMdListBox } from 'react-icons/io'
import * as GS from '@tick-tack-block/gamelogic/src/gamestate'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import * as Game from '@tick-tack-block/referee/src/model/game'
import { useStore } from '@nanostores/react'
import * as wallet from '../state/wallet'
import { useState } from 'react'

export type GameBoardProps = {
  game: Game.GameAggregate
  size: number
  onClick: (coord: GB.Coordinate) => void
}

export const GameBoard = (props: GameBoardProps) => {
  const selectedAccount = useStore(wallet.$selectedAccount)

  return (
    <Box>
      <Flex justifyContent={'center'}>
        <Box mb={2} mt={-2} ml={-2}>
          {props.game.state.state.map((row, y) => (
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
                          selectedAccount === props.game.state.players.challenger
                            ? '#ac2dba'
                            : '#1a1a1a'
                        }
                        size={120}
                      />
                    ) : slot === 'o' ? (
                      <BiCircle
                        color={
                          selectedAccount === props.game.state.players.challenged
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
            {props.game.state.type === 'finished' ? (
              <Text>
                <b>Winner:</b> {shortenAddress(props.game.state.winner)}
              </Text>
            ) : (
              <Text>
                <b>Next turn:</b>{' '}
                {shortenAddress(
                  props.game.state.players[GS.getPlayerTurn(props.game.state)],
                )}
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
                selectedAccount === props.game.state.players.challenger
                  ? 'seer.500'
                  : 'gray.800'
              }
              label={
                selectedAccount === props.game.state.players.challenger
                  ? 'Your turn!'
                  : 'Other players turn'
              }>
              {GS.getPlayerTurn(props.game.state) === 'challenger' ? (
                <Box
                  mr={2}
                  background={
                    selectedAccount === props.game.state.players.challenger
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
            {shortenAddress(props.game.state.players.challenger)}
          </Flex>
          <Flex alignItems={'center'}>
            <Text fontWeight={'bold'} flex={1}>
              Challenged(<b>O</b>):{' '}
            </Text>
            <Tooltip
              backgroundColor={
                selectedAccount === props.game.state.players.challenged
                  ? 'seer.500'
                  : 'gray.800'
              }
              label={
                selectedAccount === props.game.state.players.challenged
                  ? 'Your turn'
                  : 'Other players turn'
              }>
              {GS.getPlayerTurn(props.game.state) === 'challenged' ? (
                <Box
                  mr={2}
                  background={
                    selectedAccount === props.game.state.players.challenged
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
            {shortenAddress(props.game.state.players.challenged)}
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

const EventsList = (props: { game: Game.GameAggregate }) => {
  const sdk = useStore(wallet.$sdk)

  const [auditFetchProgress, setAuditFetchProgress] = useState(0)
  const [refereGameHash, setRefereGameHash] = useState<string>()
  const [auditedGameHash, setAuditedGameHash] = useState<string>()

  const onClickAudit = async () => {
    const start = props.game.state.events[0].blockNumber
    const end = props.game.state.events[props.game.state.events.length - 1].blockNumber

    const blocks = await slice(sdk.api, start, end, setAuditFetchProgress)

    let aggregates = Repo.memory<Game.GameAggregate, 'marketId'>({}, 'marketId')

    for (const blockEventsPair of blocks) {
      await Game.aggregate(sdk, aggregates, blockEventsPair)
    }

    const auditedGame = (await aggregates.get(props.game.marketId)) || { state: null }

    setRefereGameHash(hash(props.game.state))
    setAuditedGameHash(hash(auditedGame?.state))

    setAuditFetchProgress(0)
  }

  return (
    <>
      <Box mb="4">
        {props.game.state.events.map(event => (
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
        <Tooltip
          hasArrow
          placement="top"
          label={
            'This will fetch the blocks and events from the chain and build the gamestate locally, hashing the reported referee state and local state and comparing them.'
          }>
          <Button
            onClick={onClickAudit}
            rightIcon={<AiOutlineAudit />}
            colorScheme="seer"
            size={'xs'}
            float={'right'}>
            Audit
          </Button>
        </Tooltip>
      </Flex>
      {refereGameHash && auditedGameHash ? (
        <Box mt={4}>
          <Text fontSize={'xs'} mb={1}>
            <b>Referree state: </b> {refereGameHash}
          </Text>
          <Text fontSize={'xs'} mb={5}>
            <b>Local state: </b> {auditedGameHash}
          </Text>
          <Flex
            mb={4}
            color={refereGameHash === auditedGameHash ? 'seer.500' : 'red.500'}
            justifyContent="center">
            {refereGameHash === auditedGameHash ? (
              <BsPatchCheckFill size={32} />
            ) : (
              <MdError size={32} />
            )}
          </Flex>
        </Box>
      ) : (
        ''
      )}
    </>
  )
}
