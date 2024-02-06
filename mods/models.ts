class Models {
  #instances = {}
  constructor() {
    const modelsPath = './models.js'
    const modelsModule = require(modelsPath)
    const indices = Object.keys(modelsModule)
    for (const indice of indices) {
      const Model = modelsModule[indice]
      if (Model.prototype) {
        Object.defineProperty(this.#instances, indice, { value: new Model(), writable: false })
      }
    }
  }
  get = (name) => this.#instances[name]
}
export const models = new Models()