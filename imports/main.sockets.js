export const initSocketsServer = ({ http, onError = console.error } = {}) => {
  const configPath = './config.js'
  const { configs } = require(configPath)
  const libsPath = './libs.js'
  const { libraries } = require(libsPath)
  const socketsRoutersPath = './sockets.js'
  const routers = require(socketsRoutersPath).default
  const SocketIO = require('socket.io')
  let io = null
  const phoenixSocketsConfig = configs.get('phoenixSocketsConfig') || {}
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
  io.on('connect', async socket => {
    if (events.onConnect) {
      await events.onConnect(socket)
    }
    if (Object.prototype.hasOwnProperty.call(routers, 'connectCallbacks')) {
      for (const callback of routers.connectCallbacks) {
        await callback(socket)
      }
    }
    if (Object.prototype.hasOwnProperty.call(routers, 'disconnectingCallbacks')) {
      for (const callback of routers.disconnectingCallbacks) {
        socket.on('disconnecting', reason => callback(reason, socket))
      }
    }
    for (const { nameEvent, callback } of routers) {
      socket.on(nameEvent, async (...args) => {
        let reply = null
        if (typeof args[args.length - 1] === 'function') {
          reply = args.pop()
        }
        const { get } = libraries
        try {
          if (events.onANewRequest) {
            args = await events.onANewRequest(args, socket, get.bind(libraries))
          }
          args.push(socket)
          let response = { response: await callback(...args) }
          if (events.onBeforeToAnswer && reply) {
            response = await events.onBeforeToAnswer(response, socket, get.bind(libraries))
          }
          if (reply) {
            reply(response)
          }
        } catch ({ message, stack }) {
          let error = { error: { message, stack } }
          if (events.onBeforeToAnswer && reply) {
            error = await events.onBeforeToAnswer(error, socket, get.bind(libraries))
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