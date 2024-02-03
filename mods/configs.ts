class Configs {
  #profiles = {}
  constructor() {
    const configPath = './configurations.js'
    const configModule = require(configPath)
    const indices = Object.keys(configModule)
    for (const indice of indices) {
      Object.defineProperty(this.#profiles, indice, { value: configModule[indice], writable: false })
    }
  }
  get = (name) => this.#profiles[name]
}
export const configs = new Configs()