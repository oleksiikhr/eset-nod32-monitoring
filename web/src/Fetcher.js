'use strict'

import NProgress from 'nprogress'

function send(url, params = null) {
  NProgress.start()

  return fetch(url, params)
    .then((resp) => {
      if (!resp.ok) {
        return new Promise((_, reject) => {
          resp.text().then(reject).catch(reject)
        })
      }

      return resp
    })
}

export default class Fetcher {
  stats() {
    return send('/pc/stats')
      .then((resp) => resp.json())
      .finally(NProgress.done)
  }

  deletePc(id) {
    return send(`/pc/${id}`, { method: 'DELETE' })
      .finally(NProgress.done)
  }
}
