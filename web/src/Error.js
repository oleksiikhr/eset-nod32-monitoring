'use strict'

export default class Error {
  constructor() {
    this.element = document.querySelector('#last-error')
  }

  set(message) {
    this.element.innerText = message
  }
}
