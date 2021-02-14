'use strict'

export default class Error {
  constructor() {
    this.element = document.querySelector('#last-error')
    this.timeoutFn = null
    this.timeout = 5000
  }

  set(message) {
    clearTimeout(this.timeoutFn)

    this.element.innerText = message

    this.timeoutFn = setTimeout(() => this.element.innerText = '', this.timeout)
  }
}
