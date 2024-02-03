export class Emitter {
  #CALLBACKS = {}
  on(callback) {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16)
    })
    this.#CALLBACKS[uuid] = callback
    return uuid
  }
  off(uuid) {
    delete this.#CALLBACKS[uuid]
  }
  emit(args) {
    const callbacks = Object.values(this.#CALLBACKS)
    for (const callback of callbacks) {
      callback(args)
    }
  }
}
export class Emitters {
  #EMITTERS = new Map()
  on(event, callback) {
    if (!this.#EMITTERS.has(event)) {
      this.#EMITTERS.set(event, Emitters.createEmitter())
    }
    return this.#EMITTERS.get(event)?.on(callback) || ''
  }
  off(event, uuid) {
    this.#EMITTERS.get(event)?.off(uuid)
  }
  emit(event, args) {
    this.#EMITTERS.get(event)?.emit(args)
  }
}
Emitters.createEmitter = () => {
  return new Emitter()
}
export const globalEmitters = new Emitters()