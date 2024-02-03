const socketsControllersPath = './socketsControllers.js'
const socketsControllers = require(socketsControllersPath)
const routers: any[] = []
const indices = Object.keys(socketsControllers)
for (const controllerName of indices) {
  const Controller = socketsControllers[controllerName]
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
  }
}
export default routers