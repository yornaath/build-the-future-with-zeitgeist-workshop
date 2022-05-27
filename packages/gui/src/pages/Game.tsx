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

  const onClickSlot = async (coord: GB.Coordinate) => {
    const injected = await web3FromAddress(selectedAccount)
    const extSigner = { address: selectedAccount, signer: injected.signer }
    const tx = sdk.api.tx.system.remark(
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
        <GameBoard size={28} onClick={onClickSlot} game={game.data.state} />
      ) : (
        ''
      )}
    </Flex>
  )
}
