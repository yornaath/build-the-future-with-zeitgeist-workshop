import fastify from 'fastify'
import { encodeAddress } from '@polkadot/util-crypto'
import cors from '@fastify/cors'
import { Db } from 'mongodb'
import SDK from '@zeitgeistpm/sdk'
import oracle from './oracle'
import * as game from './model/game/game'

/**
 *
 * Api servert to serve the list of aggregated game,
 * And game by its slug
 *
 * @param db mongodb.Db
 * @param sdk @zeitgeistpm/sdk
 */

export const serve = async (db: Db, sdk: SDK) => {
  const server = fastify()

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
    return await game.list(db)
  })

  server.get('/games/:marketId', async req => {
    return await game.get(db, (req.params as any).marketId)
  })

  await server.listen(
    parseInt(process.env.REFEREE_API_PORT as string),
    '0.0.0.0',
  )

  console.log('server up')
}
