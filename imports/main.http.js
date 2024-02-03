export const initHttpServer = ({ returnInstance = false, onMessage = console.log } = {}) => {
  const configPath = './config.js'
  const { configs } = require(configPath)
  const httpRoutersPath = './http.js'
  const routers = require(httpRoutersPath).default
  const express = require('express')
  let app = express()
  const http = require('http')
  const server = http.createServer(app)
  const {
    port = (process.env.PORT ? parseInt(process.env.PORT) : 3001),
    dev,
    events = {},
    middlewares = [],
    pathsPublic,
    engineTemplates,
    optionsUrlencoded
  } = configs.get('phoenixHttpConfig') || {}
  app.set('port', port)
  let externalIp = null
  if (dev && dev.showExternalIp) {
    const interfaces = require("os").networkInterfaces()
    if (dev.interfaceNetwork) {
      const inter = interfaces[dev.interfaceNetwork]
      if (inter) {
        externalIp = inter.find(item => item.family == 'IPv4').address
      } else {
        console.error(`\nLa interfaz de red "${dev.interfaceNetwork}" no existe!.\nSe pueden usar las siguientes interfaces:\n${Object.keys(interfaces).join(', ')}`)
      }
    } else {
      console.error('\nNo se definió una interfaz de red.\nSe pueden usar las siguientes interfaces:\n' + Object.keys(interfaces).join(', '))
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
  app.use(express.text())
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