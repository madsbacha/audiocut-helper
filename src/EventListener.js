export default class EventListener {
  constructor () {
    this.events = {}
  }

  emit (event, ...args) {
    if (!this.events[event]) {
      return
    }

    for (const listener of this.events[event]) {
      listener(...args)
    }
  }

  on (event, cb) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(cb)
    return () => {
      this.removeListener(event, cb)
    }
  }

  removeListener (event, cb) {
    this.events[event] = this.events[event].filter(x => x !== cb)
  }
}
