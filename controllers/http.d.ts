import * as express from 'express'

declare global {
  namespace PhoenixJS {
    namespace Controllers {
      namespace HTTP {
        enum Methods {
          GET = 'get',
          POST = 'post',
          PUT = 'put',
          DELETE = 'delete',
          ALL = ''
        }
        type METHODS = typeof Methods
        function OnDecorator(method: Methods, path: string): (target: Object, propertyKey: string) => void
        function OnDecorator(methods: Methods[], path: string): (target: Object, propertyKey: string) => void
        type OnDecorator = typeof OnDecorator
        type ResponseError = {
          code?: string
          message: string
          stack?: string
        }
        type Next = express.NextFunction
        type ErrorMiddleware = (error?: ResponseError, req?: Request, res?: Response, next?: Next) => void
        type Middleware = (req?: Request, res?: Response, next?: Next) => void
        function AfterMiddlewareDecorator(middleware: Array<string | Middleware | ErrorMiddleware>): (target: Object, propertyKey: string) => void
        type AfterMiddlewareDecorator = typeof AfterMiddlewareDecorator
        function BeforeMiddlewareDecorator(middleware: Array<string | Middleware | ErrorMiddleware>): (target: Object, propertyKey: string) => void
        type BeforeMiddlewareDecorator = typeof BeforeMiddlewareDecorator
      }
    }
  }
}

export { }