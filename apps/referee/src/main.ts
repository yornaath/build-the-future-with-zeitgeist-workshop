import SDK from '@zeitgeistpm/sdk'
import * as DB from './db'
import * as GameAggregator from './model/game/aggregator'
import * as api from './api'

Promise.all([DB.connect(), SDK.initialize()]).then(([db, sdk]) => {
  GameAggregator.run(db, sdk)
  api.serve(db, sdk)
})
