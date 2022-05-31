import ms from 'ms'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import type { GameAggregate } from '@tick-tack-block/referee/src/model/game'
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

  const game = useQuery<GameAggregate>(
    ['game', params.slug],
    async () => {
      return fetch(`http://localhost:3000/games/${params.slug}`).then(res => res.json())
    },
    {
      enabled: Boolean(params.slug),
      refetchInterval: ms('3 seconds'),
    },
  )

  const market = useQuery<Market>(
    ['market', game.data?.marketId],
    async () => {
      return sdk.models.fetchMarketData(Number(game.data?.marketId))
    },
    {
      enabled: Boolean(game.data?.marketId),
    },
  )

  const pool = useQuery<Swap | null>(
    ['pool', market.data?.marketId],
    async () => {
      return market.data?.getPool() || null
    },
    {
      enabled: Boolean(market.data),
    },
  )

  const onClickSlot = async (coord: GB.Coordinate) => {
    try {
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
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Box>
      {game.data && (
        <>
          <Flex justifyContent={'center'} mb={12}>
            <GameBoard size={28} onClick={onClickSlot} game={game.data.state} />
          </Flex>
        </>
      )}
      {market.data && pool.data && (
        <Flex justifyContent={'center'}>
          <Betting market={market.data} pool={pool.data} />
        </Flex>
      )}
    </Box>
  )
}
