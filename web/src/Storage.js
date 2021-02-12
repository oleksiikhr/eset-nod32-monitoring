'use strict'

export default class Storage {
  static get sortColumn() {
    return localStorage.getItem('sort_column')
  }

  static set sortColumn(value) {
    localStorage.setItem('sort_column', value)
  }

  static get sortDirection() {
    return localStorage.getItem('sort_direction')
  }

  static set sortDirection(value) {
    localStorage.setItem('sort_direction', value)
  }
}
