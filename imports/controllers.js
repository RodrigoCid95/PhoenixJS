const modlsPath = './modls.js'
export const models = require(modlsPath).models
export function Model(model) {
  return (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      get() {
        return models.get(model)
      }
    })
  }
}