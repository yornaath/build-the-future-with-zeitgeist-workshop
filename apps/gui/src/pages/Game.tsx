import type { Game } from '@tick-tack-block/referee/src/model/game'
import * as GB from '@tick-tack-block/gamelogic/src/gameboard'
import { Box, Flex } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import * as wallet from '../state/wallet'

import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { GameBoard } from '../components/GameBoard'
import { web3FromAddress } from '@polkadot/extension-dapp'
import ms from 'ms'
import { Market, Swap } from '@zeitgeistpm/sdk/dist/models'

export const GamePage = () => {
  let params = useParams()

  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)

  const game = useQuery<Game>(
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
    try {
      await tx.signAndSend(selectedAccount, extSigner)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Flex justifyContent={'center'}>
      {game.data ? (
        <>
          <Box mb={4}>
            <GameBoard size={28} onClick={onClickSlot} game={game.data.state} />
          </Box>
        </>
      ) : (
        ''
      )}
    </Flex>
  )
}
