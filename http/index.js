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
module.exports.initHttpServer = async function initHttpServer({ returnInstance = false, modelManager, httpControllers, phoenixHttpConfig = {}, onMessage = console.log }) {
  const express = require('express')
  let app = express()
  const http = require('http')
  const server = http.createServer(app)
  const routers = []

  const controllersName = Object.keys(httpControllers)
  for (const controllerName of controllersName) {
    onMessage(`Iniciando controlador HTTP "${controllerName}"...`)
    const Controller = httpControllers[controllerName]
    const { models = [], routes = false } = Controller.prototype
    for (const { propertyMod, model } of models) {
      Object.defineProperty(Controller.prototype, propertyMod, { value: modelManager.getModel(model), writable: false })
    }
    delete Controller.prototype.models
    if (routes) {
      delete Controller.prototype.routes
      const controller = new Controller()
      if (controller.initialize) {
        await controller.initialize()
      }
      const router = express.Router()
      const routeKeys = Object.keys(routes)
      for (const key of routeKeys) {
        let { methods, path, method, middlewares = {} } = routes[key]
        let { before = [], after = [] } = middlewares
        before = before.map(mid => typeof mid === 'string' ? controller[mid].bind(controller) : mid)
        after = after.map(mid => typeof mid === 'string' ? controller[mid].bind(controller) : mid)
        const mids = [...before, method.bind(controller), ...after]
        for (const m of methods) {
          router[m || 'all'](path, ...mids)
        }
      }
      const r = [router]
      if (controller.prefix) {
        r.unshift(`/${controller.prefix}`)
        delete controller.prefix
      }
      routers.push(r)
    }
    onMessage(`Controlador HTTP "${controllerName}" listo!`)
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
