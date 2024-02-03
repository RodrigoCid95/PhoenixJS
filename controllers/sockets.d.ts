import * as SocketIO from 'socket.io'
import * as http from 'http'

declare function OnDecorator(nameEvent: string): (target: Object, propertyKey: string) => void
export type OnDecorator = typeof OnDecorator
interface Req<S = any> extends http.IncomingMessage {
  session: S
}
export interface Socket<S = any> extends SocketIO.Socket {
  readonly request: Req<S>
}
export type IO = SocketIO.Server
export * from '.'