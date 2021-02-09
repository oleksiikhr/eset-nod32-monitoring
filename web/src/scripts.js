'use strict'

import TableData from './TableData'
import Fetcher from './Fetcher'
import Error from './Error'
import cfg from './config'

const error = new Error()
const fetcher = new Fetcher()
const td = new TableData(fetcher, error)

td.fetchStats()
  .then(td.show.bind(td))
  .then(() => setInterval(td.fetchStats.bind(td), cfg.timeoutReload))
  .catch(alert)
