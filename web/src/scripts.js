'use strict'

import TableData from './TableData'
import Fetcher from './Fetcher'
import Error from './Error'

const td = new TableData(new Fetcher(), new Error())

td.fetchStats()
  .finally(td.show.bind(td))
  .finally(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const timeout = +urlParams.get('timeout') || 0

    if (timeout) {
      setInterval(td.fetchStats.bind(td), timeout)
    }
  })
