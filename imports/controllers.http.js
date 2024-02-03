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
export function AfterMiddleware(mids) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    for (let mid of mids) {
      if (typeof mid === 'string') {
        if (!target.hasOwnProperty(mid)) {
          console.error(`\n${target.name}: El middleware ${mid} no está declarado!`)
          return descriptor
        }
        mid = target[mid]
      }
      target.routes[propertyKey].middlewares.after.push(mid)
    }
    return descriptor
  }
}
export function BeforeMiddleware(mids) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    for (let mid of mids) {
      if (typeof mid === 'string') {
        if (!target.hasOwnProperty(mid)) {
          console.error(`\n${target.name}: El middleware ${mid} no está declarado!`)
          return descriptor
        }
        mid = target[mid]
      }
      target.routes[propertyKey].middlewares.before.push(mid)
    }
    return descriptor
  }
}
export function On(methods, path) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    target.routes[propertyKey].methods = Array.isArray(methods) ? methods : [methods]
    target.routes[propertyKey].path = path
    return descriptor
  }
}
export const METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  ALL: ''
}