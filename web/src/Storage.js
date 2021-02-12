'use strict'

function getObject(key) {
  const val = localStorage.getItem(key)

  if (val) {
    try {
      return JSON.parse(val)
    } catch (e) {
      return {}
    }
  }

  return {}
}

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

  static get headers() {
    return getObject('headers')
  }

  static set headers(value) {
    localStorage.setItem('headers', JSON.stringify(value))
  }
}
