module.exports.On = function On(nameEvent) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('routes')) {
      target.routes = []
    }
    target.routes.push({ nameEvent, propertyKey })
    return descriptor
  }
}
module.exports.Prefix = function Prefix(prefix) {
  return function (constructor) {
    return class extends constructor {
      prefix = prefix
    }
  }
}
module.exports.initSocketsServer = function initSocketsServer({ http, modelManager, libraryManager, socketsControllers: socketsControllerClasses, phoenixSocketsConfig = {}, onError = console.error }) {
  const SocketIO = require('socket.io')
  let io = null
  const {
    port = process.env.PORT ? parseInt(process.env.PORT) : 80,
    events = {}
  } = phoenixSocketsConfig
  if (http) {
    io = new SocketIO.Server(http, phoenixSocketsConfig)
  } else {
    io = SocketIO(port, phoenixSocketsConfig)
  }
  if (events.onBeforeConfig) {
    io = events.onBeforeConfig(io)
  }
  const sRoutes = []
  for (const nameClass in socketsControllerClasses) {
    const socketsControllerClass = socketsControllerClasses[nameClass]
    if (socketsControllerClass.prototype.routes) {
      const routes = socketsControllerClass.prototype.routes
      delete socketsControllerClass.prototype.routes
      let models = []
      if (socketsControllerClass.prototype.models) {
        models = socketsControllerClass.prototype.models.map(({ propertyMod, model }) => ({
          propertyMod,
          model: modelManager.getModel(model)
        }))
        delete socketsControllerClass.prototype.models
      }
      for (const { propertyMod, model } of models) {
        socketsControllerClass.prototype[propertyMod] = model
      }
      socketsControllerClass.prototype.io = io
      const instanceSocketsController = new socketsControllerClass()
      let prefix = ''
      if (instanceSocketsController.prefix) {
        prefix = instanceSocketsController.prefix
        delete instanceSocketsController.prefix
      }
      for (let { nameEvent, propertyKey } of routes) {
        nameEvent = prefix !== '' ? `${prefix} ${nameEvent}` : nameEvent
        sRoutes.push({
          nameEvent,
          callback: instanceSocketsController[propertyKey].bind(instanceSocketsController)
        })
      }
    }
  }
  io.on('connect', async socket => {
    if (events.onConnect) {
      await events.onConnect(socket)
    }
    for (const { nameEvent, callback } of sRoutes) {
      socket.on(nameEvent, async (...args) => {
        const reply = args.pop()
        const { getLibrary } = libraryManager
        try {
          if (events.onANewRequest) {
            args = await events.onANewRequest(args, socket, getLibrary.bind(libraryManager))
          }
          args.push(socket)
          let response = { data: await callback(...args) }
          if (events.onBeforeToAnswer && reply) {
            response = await events.onBeforeToAnswer(response, socket, getLibrary.bind(libraryManager))
          }
          if (reply) {
            reply(response)
          }
        } catch ({ message, stack }) {
          let error = { error: { message, stack } }
          if (events.onBeforeToAnswer && reply) {
            error = await events.onBeforeToAnswer(error, socket, getLibrary.bind(libraryManager))
          }
          onError(message)
          onError(stack)
          if (reply) {
            reply(error)
          }
        }
      })
    }
    if (events.onDisconnect) {
      socket.on("disconnect", async (reason) => await events.onDisconnect(reason))
    }
  })
}