const registerRoute = (target, propertyKey, descriptor) => {
  if (!target.hasOwnProperty('routes')) {
    target.routes = {}
  }
  if (!target.routes.hasOwnProperty(propertyKey)) {
    target.routes[propertyKey] = {
      methods: [],
      path: '',
      method: descriptor.value,
      middlewares: {
        after: [],
        before: []
      }
    }
  }
}
module.exports.afterMiddelware = function afterMid(mids) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    for (let mid of mids) {
      if (typeof mid === 'string') {
        if (!target.hasOwnProperty(mid)) {
          console.error(`\n${target.name}: El middelware ${mid} no está declarado!`)
          return descriptor
        }
        mid = target[mid].bind(target)
      }
      target.routes[propertyKey].middlewares.after.push(mid)
    }
    return descriptor
  }
}
module.exports.beforeMiddelware = function beforeMid(mids) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    for (let mid of mids) {
      if (typeof mid === 'string') {
        if (!target.hasOwnProperty(mid)) {
          console.error(`\n${target.name}: El middelware ${mid} no está declarado!`)
          return descriptor
        }
        mid = target[mid].bind(target)
      }
      target.routes[propertyKey].middlewares.before.push(mid)
    }
    return descriptor
  }
}
module.exports.On = function On(methods, path) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    target.routes[propertyKey].methods = Array.isArray(methods) ? methods : [methods]
    target.routes[propertyKey].path = path
    return descriptor
  }
}
module.exports.Prefix = function Prefix(pre) {
  return function (constructor) {
    return class extends constructor {
      prefix = pre
    }
  }
}
module.exports.Methods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  ALL: ''
}
module.exports.initHttpServer = function initHttpServer({ returnInstance = false, modelManager, httpControllers: httpControllersClasses, phoenixHttpConfig = {}, onMessage = console.log }) {
  const express = require('express')
  let app = express()
  const http = require('http')
  const server = http.createServer(app)
  const routers = []
  for (const nameClass in httpControllersClasses) {
    const httpControllerClass = httpControllersClasses[nameClass]
    if (httpControllerClass.prototype.routes) {
      const routes = httpControllerClass.prototype.routes
      delete httpControllerClass.prototype.routes
      let models = []
      if (httpControllerClass.prototype.models) {
        models = httpControllerClass.prototype.models.map(({ propertyMod, model }) => ({ propertyMod, model: modelManager.getModel(model) }))
        delete httpControllerClass.prototype.models
      }
      for (const { propertyMod, model } of models) {
        Object.defineProperty(httpControllerClass.prototype, propertyMod, { value: model, writable: false })
      }
      const instanceHttpController = new httpControllerClass()
      const router = express.Router()
      const routeKeys = Object.keys(routes)
      for (const key of routeKeys) {
        let { methods, path, method, middlewares = {} } = routes[key]
        let { before = [], after = [] } = middlewares
        before = before.map(mid => typeof mid === 'string' ? instanceHttpController[mid].bind(instanceHttpController) : mid)
        after = after.map(mid => typeof mid === 'string' ? instanceHttpController[mid].bind(instanceHttpController) : mid)
        const mids = [...before, method, ...after]
        for (const m of methods) {
          router[m || 'all'](path, ...mids)
        }
      }
      const r = [router]
      if (instanceHttpController.prefix) {
        r.unshift(`/${instanceHttpController.prefix}`)
        delete instanceHttpController.prefix
      }
      routers.push(r)
    }
  }
  const {
    port = (process.env.PORT ? parseInt(process.env.PORT) : 3001),
    dev,
    events = {},
    middlewares = [],
    pathsPublic,
    engineTemplates,
    optionsUrlencoded
  } = phoenixHttpConfig
  app.set('port', port)
  let externalIp = null
  if (dev && dev.showExternalIp) {
    const interfaces = require("os").networkInterfaces()
    if (dev.interfaceNetwork) {
      const inter = interfaces[dev.interfaceNetwork]
      if (inter) {
        externalIp = inter.find(item => item.family == 'IPv4').address
      } else {
        console.error(`\nLa interfáz de red "${dev.interfaceNetwork}" no existe!.\nSe pueden usar las isguientes interfaces:\n${Object.keys(interfaces).join(', ')}`)
      }
    } else {
      console.error('\nNo se definió una interfaz de red.\nSe pueden usar las isguientes interfaces:\n' + Object.keys(interfaces).join(', '))
    }
  }
  if (events.beforeConfig) {
    events.beforeConfig(app)
  }
  if (optionsUrlencoded) {
    app.use(express.urlencoded(optionsUrlencoded))
  }
  for (const middleware of middlewares) {
    app.use(middleware)
  }
  if (pathsPublic) {
    pathsPublic.forEach(({ route, dir }) => app.use(route, express.static(dir)))
  }
  if (engineTemplates) {
    app.engine(engineTemplates.ext, engineTemplates.callback)
    app.set('views', engineTemplates.dirViews)
    app.set('view engine', engineTemplates.name)
  }
  if (events.afterConfig) {
    events.afterConfig(app)
  }
  app.use(express.json())
  for (const router of routers) {
    app.use(...router)
  }
  if (events.onError) {
    app.use(events.onError)
  }
  server.listen(port, () => {
    onMessage(`Servidor corriendo en: http://localhost:${port}${externalIp ? ` y http://${externalIp}:${port}` : ''}`)
  })
  if (events.beforeStarting) {
    events.beforeStarting(app)
  }
  if (returnInstance) {
    return server
  }
}
