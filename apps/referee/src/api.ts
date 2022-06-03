import fastify from 'fastify'
import { encodeAddress } from '@polkadot/util-crypto'
import cors from '@fastify/cors'
import { Db } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import oracle from './model/oracle'
import * as Game from './model/game'
import { Repo } from '@tick-tack-block/lib'

/**
 *
 * Api server to serve:
 *  - Referee address formatted to the chain in use
 *  - List of aggregated games.
 *  - Aggregated game by its marketId
 *
 * @param db mongodb.Db
 * @param sdk @zeitgeistpm/sdk
 */

export const serve = async (db: Db, sdk: SDK) => {
  const server = fastify()

  const persistence = Repo.db<Game.GameAggregate, 'marketId'>(
    db,
    'games',
    'marketId',
  )

  server.register(cors)

  server.get('/referee', async () => {
    const ss58Format = (
      await sdk.api.rpc.system.properties()
    ).ss58Format.unwrapOr(0)

    return {
      address: encodeAddress(oracle.address, Number(ss58Format)),
    }
  })

  server.get('/games', async () => {
    return await persistence.list()
  })

  server.get('/games/:marketId', async req => {
    return await persistence.get((req.params as any).marketId)
  })

  await server.listen(
    parseInt(process.env.REFEREE_API_PORT as string),
    '0.0.0.0',
  )

  console.log('server up')
}
