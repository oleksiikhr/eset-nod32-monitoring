'use strict'

import state from './state'
import cfg from './config'

export function initRefreshButton(timeout) {
  const refreshBtn = document.querySelector('#refresh-btn')

  if (timeout) {
    refreshBtn.innerText += ` (${timeout/1000}s)`
    refreshBtn.classList.add('text-green-700')
  }

  refreshBtn.addEventListener('click', () => {
    const input = prompt('Периодичность обновления данных в секундах. 0 - отключить')
    if (input === null) {
      return
    }

    let seconds = +input

    if (seconds === 0) {
      state.urlParams.delete(cfg.queryTimeout)
      window.location.search = state.urlParams.toString()
    } else if (seconds) {
      seconds *= 1000
      state.urlParams.set(cfg.queryTimeout, seconds.toString())
      window.location.search = state.urlParams.toString()
    }
  })
}