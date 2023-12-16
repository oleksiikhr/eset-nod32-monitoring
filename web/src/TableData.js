'use strict'

import differenceInHours from 'date-fns/differenceInHours'
import formatDistance from 'date-fns/formatDistance'
import format from 'date-fns/format'
import Storage from './Storage'
import cfg from './config'

const DEFAULT_VISIBLE_COLUMNS = { name: true, ip: true, updated_at: true }
const COLUMNS = ['_name', '_ipNum', 'nod32', '_nod32_scanner', 'os', 'app_version', 'updated_at']
const DIRECTION = ['asc', 'desc']
const DEFAULT_COLUMN = '_name'
const DEFAULT_DIRECTION = 'asc'
const COLORS = [
  { hours: 3, color: 'bg-yellow-50' },
  { hours: 24, color: 'bg-red-50' },
  { hours: 3 * 24, color: 'bg-yellow-100' },
  { hours: 7 * 24, color: 'bg-red-100' },
]

export default class TableData {
  constructor(Fetcher, Error) {
    this.tableElement = document.querySelector('table')
    this.tbodyElement = this.tableElement.querySelector('tbody')
    this.itemTemplateElement = document.querySelector('template#tr-item')
    this.countElement = document.querySelector('#pc-count')

    this.Fetcher = Fetcher
    this.Error = Error
    this.elements = []
    this.renderNodes = []

    this.initSort()
    this.initHeader()
  }

  initSort() {
    ({ direction: this.sortDirection, column: this.sortColumn } = this.safeGetSort())
    this.sortElement = this.tableElement.querySelector(`[x-attr="${this.sortColumn}"]`)
    this.sortElement.querySelector(this.sortDirection === 'asc' ? '.arrow-top' : '.arrow-bottom').classList.remove('hidden')
  }

  initHeader() {
    this.visibleHeaders = Storage.headers
    if (!Object.keys(this.visibleHeaders).length) {
      this.visibleHeaders = DEFAULT_VISIBLE_COLUMNS
    }

    const documentClickFn = () => {
      columnMenuDropdown.classList.add('hidden')
      document.removeEventListener('click', documentClickFn)
    }

    const columnMenuDropdown = document.querySelector('#column-menu-dropdown')
    document.querySelector('#column-menu').addEventListener('click', (evt) => {
      evt.stopPropagation()

      if (columnMenuDropdown.classList.contains('hidden')) {
        columnMenuDropdown.classList.remove('hidden')
        document.addEventListener('click', documentClickFn)
      } else {
        columnMenuDropdown.classList.add('hidden')
      }
    })

    const headerElements = this.mapByAttr(this.tableElement, 'x-column')

    columnMenuDropdown.querySelectorAll('[role="menuitem"]').forEach((element) => {
      const column = element.getAttribute('x-column')
      const activeElement = element.querySelector('.active')
      const noActiveElement = element.querySelector('.no-active')

      const updateDom = () => {
        if (this.visibleHeaders[column]) {
          activeElement.classList.remove('hidden')
          noActiveElement.classList.add('hidden')
          headerElements[column].classList.remove('hidden')
        } else {
          activeElement.classList.add('hidden')
          noActiveElement.classList.remove('hidden')
          headerElements[column].classList.add('hidden')
        }
      }

      updateDom()

      element.addEventListener('click', (evt) => {
        evt.stopPropagation()

        if (this.visibleHeaders[column]) {
          delete this.visibleHeaders[column]
        } else {
          this.visibleHeaders[column] = true
        }

        updateDom()
        this.elements.forEach((item) => this.applyFilterColumns(item._element))
        this.render()
        Storage.headers = this.visibleHeaders
      })
    })

    this.tableElement.querySelectorAll('th.cursor-pointer').forEach((element) => {
      element.addEventListener('click', this.onClickHeader.bind(this, element))
    })
  }

  applyFilterColumns(element) {
    const columns = this.mapByAttr(element, 'x-column')

    Object.entries(columns).forEach(([name, column]) => {
      if (this.visibleHeaders[name]) {
        column.classList.remove('hidden')
      } else {
        column.classList.add('hidden')
      }
    })
  }

  fetchStats() {
    return this.Fetcher.stats()
      .then((json) => {
        const now = new Date()

        this.elements = json.list.map((item) => {
          let nod32Scanner = '';

          if (item.nod32_version && item.nod32_fetched_at) {
            const fetchedAt = new Date(item.nod32_fetched_at);

            nod32Scanner = `${item.nod32_version} (${format(fetchedAt, 'dd.MM.yyyy')})`;
          }

          item._name = item.name.toLowerCase()
          item._ipNum = item.ip.length ? Number(item.ip[0].split('.').map((num) => (`000${num}`).slice(-3)).join('')) : 0
          item._nod32_scanner = nod32Scanner
          item.updated_at = new Date(item.updated_at)
          item.created_at = new Date(item.created_at)
          item._element = this.createItem(item, now)

          return item
        })
      })
      .then(this.renderCount.bind(this))
      .then(this.applySort.bind(this))
      .then(this.render.bind(this))
      .catch(this.Error.set.bind(this.Error))
  }

  onClickHeader(element) {
    this.sortElement.querySelector(this.sortDirection === 'asc' ? '.arrow-top' : '.arrow-bottom').classList.add('hidden')

    if (this.sortElement === element) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortColumn = element.getAttribute('x-attr')
      this.sortDirection = 'asc'
    }

    element.querySelector(this.sortDirection === 'asc' ? '.arrow-top' : '.arrow-bottom').classList.remove('hidden')
    this.sortElement = element

    this.storeSort()
    this.applySort()
    this.render()
  }

  storeSort() {
    Storage.sortColumn = this.sortColumn
    Storage.sortDirection = this.sortDirection
  }

  applySort() {
    this.elements.sort((a, b) => {
      if (a[this.sortColumn] < b[this.sortColumn]) {
        return this.sortDirection === 'asc' ? -1 : 1
      }

      if (a[this.sortColumn] > b[this.sortColumn]) {
        return this.sortDirection === 'asc' ? 1 : -1
      }

      return 0
    })
  }

  render() {
    let pointer = 0
    let i = 0
    let j = 0

    while (i < this.elements.length && j < this.renderNodes.length) {
      if (this.elements[i]._element.outerHTML === this.renderNodes[j].outerHTML) {
        this.renderNodes[pointer] = this.renderNodes[j]
        i++
        j++
        pointer++
      } else {
        this.renderNodes[j].remove()
        j++
      }
    }

    while (j < this.renderNodes.length) {
      this.renderNodes[j].remove()
      j++
    }

    while (i < this.elements.length) {
      this.renderNodes[pointer] = this.elements[i]._element
      this.append(this.renderNodes[pointer])
      i++
      pointer++
    }

    if (j > pointer) {
      this.renderNodes.splice(pointer)
    }
  }

  createItem({ id, name, ip, os, nod32, _nod32_scanner, app_version, updated_at }, date = new Date()) {
    const root = this.cloneTemplate().children[0]
    const slots = this.mapByAttr(root, 'x-slot')
    const actions = this.mapByAttr(root, 'x-action')

    slots.name.innerText = name
    slots.nod32.innerText = nod32
    slots.nod32_scanner.innerText = _nod32_scanner
    slots.os.innerText = os
    slots.ip.innerText = this.format(ip).array()
    slots.app_version.innerText = app_version
    slots.updated_at.innerText = this.format(updated_at).dateTime(date)

    const color = this.identifyColor(updated_at, date)
    color && root.classList.add(color)

    this.applyFilterColumns(root)

    actions.delete.addEventListener('click', () => this.onClickDeleteItem(root, actions.delete, id))

    return root
  }

  onClickDeleteItem(root, btn, id) {
    if (!confirm('Are you sure you want to delete this PC?')) {
      return Promise.reject('cancel')
    }

    btn.classList.add('pointer-events-none', 'opacity-50')

    return this.Fetcher.deletePc(id)
      .then((resp) => {
        const index = this.elements.findIndex((element) => element.id === id)
        if (index !== -1) {
          this.elements.splice(index, 1)
        }

        this.renderCount()
        root.remove()

        return resp
      })
      .catch((err) => {
        this.Error.set(err)

        btn.classList.remove('pointer-events-none', 'opacity-50')
      })
  }

  format(value) {
    return {
      array(separator = ', ') {
        return value.join(separator)
      },
      dateTime(date = new Date()) {
        return formatDistance(value, date, { locale: cfg.locale })
      }
    }
  }

  mapByAttr(element, attr) {
    return [...element.querySelectorAll(`[${attr}]`)]
      .reduce((result, el) => {
        result[el.getAttribute(attr)] = el

        return result
      }, {})
  }

  identifyColor(date, currentDate = new Date()) {
    const diff = differenceInHours(currentDate, date)
    let chooseColor = null

    for (const { hours, color } of COLORS) {
      if (diff < hours) {
        break
      }

      chooseColor = color
    }

    return chooseColor
  }

  safeGetSort() {
    let [column, direction] = [Storage.sortColumn, Storage.sortDirection]

    if (!COLUMNS.includes(column)) {
      column = DEFAULT_COLUMN
    }

    if (!DIRECTION.includes(direction)) {
      direction = DEFAULT_DIRECTION
    }

    return { column, direction }
  }

  renderCount() {
    this.countElement.innerText = this.elements.length
  }

  cloneTemplate() {
    return this.itemTemplateElement.content.cloneNode(true)
  }

  show() {
    this.tableElement.classList.remove('hidden')

    setTimeout(() => this.tableElement.classList.remove('opacity-0'))
  }

  append(...nodes) {
    this.tbodyElement.append(...nodes)
  }
}
