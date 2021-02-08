const DATE_LOCALE = 'ru-RU'
const DATE_OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

class TableData {
  constructor(fetcher) {
    this.tableElement = document.querySelector('table')
    this.tbodyElement = document.querySelector('tbody')
    this.itemTemplateElement = document.querySelector('template#tr-item')
    this.fetcher = fetcher
    this.elements = []
  }

  renderMultiple(arr) {
    this.elements = arr

    const nodes = this.elements.map((json) => td.createItem(json))

    this.clear()

    td.append(...nodes)
  }

  createItem({ id, key, name, ip, updated_at }) {
    const clone = this.cloneItem()
    const root = clone.querySelector('tr')
    const slots = this.mapByAttr(clone, 'x-slot')
    const actions = this.mapByAttr(clone, 'x-action')

    slots.key.innerText = key.substr(0, 4) + '...' + key.substr(key.length - 4)
    slots.name.innerText = this.format(name).string()
    slots.ip.innerText = this.format(ip).array()
    slots.time.innerText = this.format(new Date(updated_at)).dateTime()

    slots.key.setAttribute('title', key)

    root.setAttribute('x-id', id)
    actions.delete.addEventListener('click', () => this.onClickDeleteItem(root, actions.delete, id))

    return clone
  }

  onClickDeleteItem(root, btn, id) {
    if (!confirm('Вы действительно хотите удалить этот ПК?')) {
      return
    }

    btn.classList.add('pointer-events-none', 'opacity-50')

    this.fetcher.deletePc(id)
      .then(() => root.remove())
      .catch(alert)
      .finally(() => btn.classList.remove('pointer-events-none', 'opacity-50'))
  }

  format(value) {
    return {
      array(separator = ', ') {
        return value.join(separator)
      },
      dateTime() {
        return value.toLocaleDateString(DATE_LOCALE, DATE_OPTIONS)
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

class Fetcher {
  send(url, params = null) {
    NProgress.start()

    return fetch(url, params)
      .then((resp) => {
        if (!resp.ok) {
          return new Promise((resolve, reject) => {
            resp.text().then(reject).catch(reject)
          })
        }

        return resp
      })
  }

  stats() {
    return this.send('/pc/stats')
      .then((resp) => resp.json())
      .finally(NProgress.done)
  }

  deletePc(id) {
    return this.send(`/pc/${id}`, { method: 'DELETE' })
      .finally(NProgress.done)
  }
}

const fetcher = new Fetcher()
const td = new TableData(fetcher)

fetcher.stats()
  .then((json) => td.renderMultiple(json.list))
  .then(() => td.show())
  .catch(alert)
