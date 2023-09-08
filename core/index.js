module.exports.ConfigManager = class ConfigManager {
  constructor(profiles = {}) {
    Object.defineProperty(this, 'profiles', { value: profiles, writable: false })
  }
  getConfig(name) {
    return this.profiles[name] || {}
  }
}
module.exports.Flags = class Flags {
  /**
   * Constructor.
   */
  constructor() {
    const argList = process.argv
    this.args = {}
    let a
    let opt
    let thisOpt
    let curOpt
    for (a = 0; a < argList.length; a++) {
      thisOpt = argList[a].trim()
      opt = thisOpt.replace(/^\-+/, '')
      if (opt === thisOpt) {
        if (curOpt) this.args[curOpt] = opt
        curOpt = null
      } else {
        curOpt = opt
        this.args[curOpt] = true
      }
    }
  }
  /**
   * Look for a convert argument from the command line.
   * @param {string} name Argument name.
   * @returns {string | boolean} Returns the value of a variable.
   */
  get(name) {
    return this.args[name]
  }
}
module.exports.Lib = function Lib(nameLib) {
  return (target, propertyKey) => {
    if (!target.hasOwnProperty('libs')) {
      target.libs = []
    }
    target.libs.push({
      propertyLib: propertyKey,
      nameLib
    })
  }
}
module.exports.LibraryManager = class LibraryManager {
  constructor(configManager, libraries) {
    this.configManager = configManager
    this.libraries = libraries
    this.instances = {}
  }
  async initialize(log = console.log) {
    const librariesName = Object.keys(this.libraries)
    for (const libraryName of librariesName) {
      log(`Iniciando librería "${libraryName}"...`)
      const library = this.libraries[libraryName]
      const result = await library(this.configManager.getConfig(libraryName))
      Object.defineProperty(this.instances, libraryName, { value: result, writable: false })
      log(`Librería "${libraryName}" lista!`)
    }
    this.isCompiled = true
  }
  getLibrary(name) {
    return this.instances[name]
  }
}
module.exports.Model = function Model(model) {
  return (target, propertyKey) => {
    if (!target.hasOwnProperty('models')) {
      target.models = []
    }
    target.models.push({
      propertyMod: propertyKey,
      model
    })
  }
}
module.exports.ModelManager = class ModelsManager {
  constructor(models, lm) {
    this.instances = {}
    this.models = models
    this.lm = lm
  }
  async initialize(log = console.log) {
    const modelsName = Object.keys(this.models)
    for (const modelName of modelsName) {
      log(`Iniciando Modelo "${modelName}"...`)
      const Model = this.models[modelName]
      const { libs = [] } = Model.prototype
      for (const { propertyLib, nameLib } of libs) {
        Object.defineProperty(Model.prototype, propertyLib, { value: this.lm.getLibrary(nameLib), writable: false })
      }
      delete Model.prototype.libs
      const model = new Model()
      if (model.initialize) {
        await model.initialize()
      }
      Object.defineProperty(this.instances, modelName, { value: model, writable: false })
      log(`Modelo "${modelName}" listo!`)
    }
  }
  getModel(name) {
    return this.instances[name]
  }
}