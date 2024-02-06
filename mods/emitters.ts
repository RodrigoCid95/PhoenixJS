class Emitter {
  #CALLBACKS: {
    [x: string]: any
  } = {}
  on(callback: any) {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16)
    })
    this.#CALLBACKS[uuid] = callback
    return uuid
  }
  off(uuid: string) {
    delete this.#CALLBACKS[uuid]
  }
  emit<T = {}>(args?: T | undefined) {
    const callbacks = Object.values(this.#CALLBACKS)
    for (const callback of callbacks) {
      callback(args)
    }
  }
}
class Emitters {
  #EMITTERS = new Map()
  static createEmitter() {
    return new Emitter()
  }
  on(event: string, callback: any) {
    if (!this.#EMITTERS.has(event)) {
      this.#EMITTERS.set(event, Emitters.createEmitter())
    }
    return this.#EMITTERS.get(event)?.on(callback) || ''
  }
  off(event: string, uuid: string) {
    this.#EMITTERS.get(event)?.off(uuid)
  }
  emit<T = undefined>(event: string, args?: T | undefined) {
    this.#EMITTERS.get(event)?.emit(args)
  }
}
export const globalEmitters = new Emitters()