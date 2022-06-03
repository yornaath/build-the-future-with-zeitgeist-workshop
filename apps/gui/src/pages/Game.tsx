import ms from 'ms'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import type { GameAggregate } from '@tick-tack-block/referee/src/model/game/game'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { Box, Flex, useToast } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import { Market, Swap } from '@zeitgeistpm/sdk/dist/models'
import * as wallet from '../state/wallet'
import { GameBoard } from '../components/GameBoard'
import { Betting } from '../components/Betting'
import { extrinsicCallback, getTransactionError } from '@tick-tack-block/lib'

export const GamePage = () => {
  let params = useParams()

  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)

  const toast = useToast()

  const { data: game } = useQuery<GameAggregate>(
    ['game', params.id],
    async () => {
      return fetch(`http://localhost:3000/games/${params.id}`).then(res => res.json())
    },
    {
      enabled: Boolean(params.id),
      refetchInterval: ms('2 seconds'),
    },
  )

  const { data: market } = useQuery<Market>(
    ['market', game?.marketId],
    async () => {
      return sdk.models.fetchMarketData(Number(game?.marketId))
    },
    {
      enabled: Boolean(game?.marketId),
    },
  )

  const { data: pool } = useQuery<Swap | null>(
    ['pool', market?.marketId],
    async () => {
      return market?.getPool() || null
    },
    {
      enabled: Boolean(market),
    },
  )

  const onClickSlot = async (coord: GB.Coordinate) => {
    const injected = await web3FromAddress(selectedAccount)
    const extSigner = { address: selectedAccount, signer: injected.signer }

    const tx = sdk.api.tx.system.remarkWithEvent(
      JSON.stringify({
        type: 'turn',
        marketId: game?.marketId,
        turn: {
          coord,
        },
      }),
    )

    await tx.signAndSend(
      selectedAccount,
      extSigner,
      extrinsicCallback({
        broadcastCallback: () => {
          if (!toast.isActive('turn-broadcast')) {
            toast({
              id: 'turn-broadcast',
              title: 'Broadcasting turn',
              description: `Putting piece in ${coord[0]}:${coord[1]}`,
              status: 'loading',
              duration: 5000,
              isClosable: true,
            })
          }
        },
        successCallback: data => {
          toast({
            id: 'turn-success',
            title: 'Success',
            description: 'Turn made!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
        },
        failCallback: ({ index, error }) => {
          toast({
            id: 'turn-error',
            title: 'Error.',
            description: getTransactionError(sdk, index, error),
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
        },
      }),
    )
  }

  return (
    <Box>
      {game && (
        <>
          <Flex justifyContent={'center'} mb={12}>
            <GameBoard size={28} onClick={onClickSlot} game={game} />
          </Flex>
        </>
      )}
      {market && pool && (
        <Flex justifyContent={'center'}>
          <Betting market={market} pool={pool} />
        </Flex>
      )}
    </Box>
  )
}
