'use strict'

import formatDistance from 'date-fns/formatDistance';
import cfg from './config'

export default class TableData {
  constructor(Fetcher, Error) {
    this.tableElement = document.querySelector('table')
    this.tbodyElement = this.tableElement.querySelector('tbody')
    this.thElements = this.tableElement.querySelector('th')
    this.itemTemplateElement = document.querySelector('template#tr-item')
    this.Fetcher = Fetcher
    this.Error = Error
    this.elements = []
  }

  fetchStats() {
    return this.Fetcher.stats()
      .then((json) => this.render(json.list))
      .catch((err) => this.Error.set(err))
  }

  render(arr) {
    this.elements = arr

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
    slots.time.innerText = this.format(new Date(updated_at)).dateTime()

    root.setAttribute('x-id', id)
    actions.delete.addEventListener('click', () => this.onClickDeleteItem(root, actions.delete, id))

    return clone
  }

  onClickDeleteItem(root, btn, id) {
    if (!confirm('Вы действительно хотите удалить этот ПК?')) {
      return
    }

    btn.classList.add('pointer-events-none', 'opacity-50')

    return this.Fetcher.deletePc(id)
      .then(() => root.remove())
      .catch((err) => this.Error.set(err))
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
