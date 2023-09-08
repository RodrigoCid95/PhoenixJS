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
module.exports.initSocketsServer = async function initSocketsServer({ http, modelManager, libraryManager, socketsControllers, phoenixSocketsConfig = {}, onError = console.error }) {
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
  const routers = []
  const contrllersName = Object.keys(socketsControllers)
  for (const controllerName of contrllersName) {
    const Controller = socketsControllers[controllerName]
    const { models = [], routes = false } = Controller.prototype
    for (const { propertyMod, model } of models) {
      Object.defineProperty(Controller.prototype, propertyMod, { value: modelManager.getModel(model), writable: false })
    }
    delete Controller.prototype.models
    if (routes) {
      delete Controller.prototype.models
      const controller = new Controller()
      if (controller.initialize) {
        await controller.initialize()
      }
      let prefix = ''
      if (Controller.prefix) {
        prefix = Controller.prefix
        delete Controller.prefix
      }
      for (let { nameEvent, propertyKey } of routes) {
        nameEvent = prefix !== '' ? `${prefix} ${nameEvent}` : nameEvent
        routers.push({
          nameEvent,
          callback: controller[propertyKey].bind(controller)
        })
      }
    }
  }
  io.on('connect', async socket => {
    if (events.onConnect) {
      await events.onConnect(socket)
    }
    for (const { nameEvent, callback } of routers) {
      socket.on(nameEvent, async (...args) => {
        const reply = args.pop()
        const { getLibrary } = libraryManager
        try {
          if (events.onANewRequest) {
            args = await events.onANewRequest(args, socket, getLibrary.bind(libraryManager))
          }
          args.push(socket)
          let response = { response: await callback(...args) }
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