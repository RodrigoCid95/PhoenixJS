import * as express from 'express'

declare enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  ALL = ''
}
export type METHODS = typeof Methods
declare function OnDecorator(method: Methods, path: string): (target: Object, propertyKey: string) => void
declare function OnDecorator(methods: Methods[], path: string): (target: Object, propertyKey: string) => void
export type OnDecorator = typeof OnDecorator
export declare type ResponseError = {
  code?: string
  message: string
  stack?: string
}
export declare type Next = express.NextFunction
export declare type ErrorMiddleware = (error?: ResponseError, req?: Request, res?: Response, next?: Next) => void
export declare type Middleware = (req?: Request, res?: Response, next?: Next) => void
declare function AfterMiddlewareDecorator(middleware: Array<string | Middleware | ErrorMiddleware>): (target: Object, propertyKey: string) => void
export type AfterMiddlewareDecorator = typeof AfterMiddlewareDecorator
declare function BeforeMiddlewareDecorator(middleware: Array<string | Middleware | ErrorMiddleware>): (target: Object, propertyKey: string) => void
export type BeforeMiddlewareDecorator = typeof BeforeMiddlewareDecorator
export * from '.'