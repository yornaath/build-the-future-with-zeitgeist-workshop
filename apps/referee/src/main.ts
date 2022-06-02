import SDK from '@zeitgeistpm/sdk'
import * as DB from './db'
import { aggregateGames } from './aggregation'
import * as api from './api'

Promise.all([DB.connect(), SDK.initialize()]).then(([db, sdk]) => {
  aggregateGames(db, sdk)
  api.serve(db, sdk)
})
