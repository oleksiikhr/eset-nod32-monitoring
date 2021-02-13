'use strict'

import state from './state'
import cfg from './config'

export function initTopButton(options = { top: 0, left: 0, behavior: 'smooth' }) {
  const element = document.querySelector('#top-btn')

  element.addEventListener('click', () => window.scrollTo(options))
}

export function initRefreshButton(timeout) {
  const refreshBtn = document.querySelector('#refresh-btn')

  if (timeout) {
    refreshBtn.querySelector('span').innerText += ` (${timeout/1000}s)`
    refreshBtn.classList.add('text-green-700')
  }

  refreshBtn.addEventListener('click', () => {
    const input = prompt('Периодичность обновления данных в секундах')
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
