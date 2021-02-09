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
    this.Fetcher = Fetcher
    this.Error = Error
    this.elements = []

    this.colors = [
      { hours: 24, color: 'bg-yellow-50' },
      { hours: 3 * 24, color: 'bg-red-50' },
      { hours: 7 * 24, color: 'bg-yellow-100' },
      { hours: 14 * 24, color: 'bg-red-100' },
    ]

    this.sortElement = this.tableElement.querySelector('[x-attr="name"]')
    this.sortDirection = 'asc'
    this.sortColumn = 'name'

    this.thClickableElements.forEach((element) => {
      element.addEventListener('click', this.onClickHeader.bind(this, element))
    })
  }

  fetchStats() {
    return this.Fetcher.stats()
      .then((json) => this.elements = json.list.map((item) => ({
        ...item,
        ipStr: item.ip.join(', '),
        updated_at: new Date(item.updated_at),
        created_at: new Date(item.created_at)
      })))
      .catch((err) => this.Error.set(err))
      .then(this.applySort.bind(this))
      .then(this.render.bind(this))
  }

  fetchDeletePc(id) {
    return this.Fetcher.deletePc(id)
      .catch((err) => this.Error.set(err))
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
    const nodes = this.elements.map((json) => this.createItem(json))

    this.clear()

    this.append(...nodes)
  }

  createItem({ id, name, ip, updated_at }) {
    const clone = this.cloneItem()
    const root = clone.querySelector('tr')
    const slots = this.mapByAttr(clone, 'x-slot')
    const actions = this.mapByAttr(clone, 'x-action')

    slots.name.innerText = this.format(name).string()
    slots.ip.innerText = this.format(ip).array()
    slots.updated_at.innerText = this.format(updated_at).dateTime()

    root.setAttribute('x-id', id)
    actions.delete.addEventListener('click', () => this.onClickDeleteItem(root, actions.delete, id))

    this.applyColor(root, updated_at)

    return clone
  }

  onClickDeleteItem(root, btn, id) {
    if (!confirm('Вы действительно хотите удалить этот ПК?')) {
      return
    }

    btn.classList.add('pointer-events-none', 'opacity-50')

    return this.fetchDeletePc(id)
      .then(() => root.remove())
      .finally(() => btn.classList.remove('pointer-events-none', 'opacity-50'))
  }

  format(value) {
    return {
      array(separator = ', ') {
        return value.join(separator)
      },
      dateTime() {
        return formatDistance(value, new Date(), { locale: cfg.locale })
      },
      string() {
        return value
      },
    }
  }

  mapByAttr(element, attr) {
    return [...element.querySelectorAll(`[${attr}]`)]
      .reduce((result, el) => {
        result[el.getAttribute(attr)] = el

        return result
      }, {})
  }

  applyColor(element, date) {
    const diff = differenceInHours(new Date(), date)
    let chooseColor = null

    for (const { hours, color } of this.colors) {
      if (diff < hours) {
        break
      }

      chooseColor = color
    }

    if (chooseColor) {
      element.classList.add(chooseColor)
    }
  }

  clear() {
    this.tbodyElement.innerText = ''
  }

  cloneItem() {
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
