'use strict'

import differenceInHours from 'date-fns/differenceInHours'
import formatDistance from 'date-fns/formatDistance'
import cfg from './config'

export default class TableData {
  constructor(Fetcher, Error) {
    this.tableElement = document.querySelector('table')
    this.tbodyElement = this.tableElement.querySelector('tbody')
    this.thClickableElements = this.tableElement.querySelectorAll('th.cursor-pointer')
    this.itemTemplateElement = document.querySelector('template#tr-item')
    this.countElement = document.querySelector('#pc-count')

    this.Fetcher = Fetcher
    this.Error = Error
    this.elements = []
    this.colors = [
      { hours: 1, color: 'bg-yellow-50' },
      { hours: 24, color: 'bg-red-50' },
      { hours: 3 * 24, color: 'bg-yellow-100' },
      { hours: 7 * 24, color: 'bg-red-100' },
    ]

    this.sortElement = this.tableElement.querySelector('[x-attr="_name"]')
    this.sortDirection = 'asc'
    this.sortColumn = '_name'

    this.thClickableElements.forEach((element) => {
      element.addEventListener('click', this.onClickHeader.bind(this, element))
    })
  }

  fetchStats() {
    const now = new Date()

    return this.Fetcher.stats()
      .then((json) => this.elements = json.list.map((item, index) => {
        const updatedAt = new Date(item.updated_at)

        item._name = item.name.toLowerCase()
        item._ipNum = item.ip.length ? Number(item.ip[0].split('.').map((num) => (`000${num}`).slice(-3)).join('')) : 0
        item.updated_at = updatedAt
        item.created_at = new Date(item.created_at)
        item._element = this.createItem(item, index, now)

        return item
      }))
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

    this.applySort()
    this.render()
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
    const nodes = this.elements.map((item) => item._element)

    this.clearContent()

    this.append(...nodes)
  }

  createItem({ id, name, ip, _color, updated_at }, index, date = new Date()) {
    const root = this.cloneTemplate().children[0]
    const slots = this.mapByAttr(root, 'x-slot')
    const actions = this.mapByAttr(root, 'x-action')

    slots.name.innerText = this.format(name).string()
    slots.ip.innerText = this.format(ip).array()
    slots.updated_at.innerText = this.format(updated_at).dateTime(date)

    const color = this.identifyColor(updated_at, date)
    color && root.classList.add(color)

    root.setAttribute('x-id', id)

    actions.delete.addEventListener('click', () => this.onClickDeleteItem(root, actions.delete, id, index))

    return root
  }

  onClickDeleteItem(root, btn, id, index) {
    if (!confirm('Вы действительно хотите удалить этот ПК?')) {
      return
    }

    btn.classList.add('pointer-events-none', 'opacity-50')

    return this.Fetcher.deletePc(id)
      .then((resp) => {
        this.elements.splice(index, 1)

        root.remove()

        return resp
      })
      .catch((err) => this.Error.set(err))
      .finally(() => btn.classList.remove('pointer-events-none', 'opacity-50'))
  }

  format(value) {
    return {
      array(separator = ', ') {
        return value.join(separator)
      },
      dateTime(date = new Date()) {
        return formatDistance(value, date, { locale: cfg.locale })
      },
      string() {
        return value
      },
      number() {
        return value.toString()
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

    for (const { hours, color } of this.colors) {
      if (diff < hours) {
        break
      }

      chooseColor = color
    }

    return chooseColor
  }

  renderCount() {
    this.countElement.innerText = this.elements.length
  }

  clearContent() {
    this.tbodyElement.innerText = ''
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
