const libsPath = './libs.js'
export const libraries = require(libsPath).libraries
export function Library(nameLib) {
  return (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      get() {
        return libraries.get(nameLib)
      }
    })
  }
}