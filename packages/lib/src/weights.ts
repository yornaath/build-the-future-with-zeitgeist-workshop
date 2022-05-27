import { CategoryMetadata, DecodedMarketMetadata } from '@zeitgeistpm/sdk/dist/types'
import { ZTG } from './ztg'

export const weigh = (
  metadata: DecodedMarketMetadata & {
    categories: CategoryMetadata[]
  },
) => {
  const numOutcomes = metadata.categories.length

  const baseWeight = (1 / numOutcomes) * 10 * ZTG

  const weightsNums = [...Array(numOutcomes).keys()].map(_ => {
    return baseWeight
  })

  const totalWeight = weightsNums.reduce<number>((acc, curr) => {
    return acc + curr
  }, 0)

  const weights = [
    ...weightsNums.map(w => Math.floor(w).toString()),
    totalWeight.toString(),
  ]

  return weights
}
