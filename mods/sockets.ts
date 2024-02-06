const socketsControllersPath = './socketsControllers.js'
const socketsControllers = require(socketsControllersPath)
const routers: any[] = []
const indices = Object.keys(socketsControllers)
for (const controllerName of indices) {
  const Controller = socketsControllers[controllerName]
  if (Controller.prototype) {
    const { routes = false } = Controller.prototype
    if (routes) {
      delete Controller.prototype.routes
      const controller = new Controller()
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
      debugger
      if (Controller.prototype.onConnection) {
        if (!Object.prototype.hasOwnProperty.call(routers, 'connectCallbacks')) {
          Object.defineProperty(routers, 'connectCallbacks', { value: [], writable: false })
        }
        (routers as any).connectCallbacks.push(controller['onConnection'].bind(controller))
      }
      if (Controller.prototype.onDisconnecting) {
        if (!Object.prototype.hasOwnProperty.call(routers, 'disconnectingCallbacks')) {
          Object.defineProperty(routers, 'disconnectingCallbacks', { value: [], writable: false })
        }
        (routers as any).disconnectingCallbacks.push(controller['onDisconnecting'].bind(controller))
      }
    }
  }
}
export default routers