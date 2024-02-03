export function On(nameEvent) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('routes')) {
      target.routes = []
    }
    target.routes.push({ nameEvent, propertyKey })
    return descriptor
  }
}
export function Prefix(prefix) {
  return function (constructor) {
    return class extends constructor {
      prefix = prefix
    }
  }
}