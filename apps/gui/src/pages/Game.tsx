import ms from 'ms'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import type { GameAggregate } from '@tick-tack-block/referee/src/model/game/game'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { Box, Flex } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import { Market, Swap } from '@zeitgeistpm/sdk/dist/models'
import * as wallet from '../state/wallet'
import { GameBoard } from '../components/GameBoard'
import { Betting } from '../components/Betting'

export const GamePage = () => {
  let params = useParams()

  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)

  const { data: game } = useQuery<GameAggregate>(
    ['game', params.slug],
    async () => {
      return fetch(`http://localhost:3000/games/${params.slug}`).then(res => res.json())
    },
    {
      enabled: Boolean(params.slug),
      refetchInterval: ms('3 seconds'),
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
        slug: params.slug,
        turn: {
          coord,
        },
      }),
    )

    await tx.signAndSend(selectedAccount, extSigner)
  }

  return (
    <Box>
      {game && (
        <>
          <Flex justifyContent={'center'} mb={12}>
            <GameBoard size={28} onClick={onClickSlot} game={game.state} />
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
