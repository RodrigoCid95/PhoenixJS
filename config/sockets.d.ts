import * as SocketIO from 'socket.io'
import * as http from 'http'
import { Libraries } from './../models'

interface Req<S = any> extends http.IncomingMessage {
  session: S
}
/**
 * Web socket.
 */
export interface Socket<S = any> extends SocketIO.Socket {
  readonly request: Req<S>
}
export interface PhoenixSocketsConfig extends Partial<SocketIO.ServerOptions> {
  /**
  * Port the server is listening on.
  * @type {number}
  */
  port?: number
  /**
   * Events.
   */
  events?: {
    onBeforeConfig?: (io: SocketIO.Server) => SocketIO.Server | Promise<SocketIO.Server>
    /**
     * Called when a new connection is created.
     */
    onConnect?: (socket: Socket) => void | Promise<void>
    /**
     * Called before returning a response to the client.
     */
    onBeforeToAnswer?: (response: any, socket: Socket, getLibraryInstance: Libraries['get']) => any | Promise<any>
    /**
     * Called when a call is made by the customer.
     */
    onANewRequest?: (request: any[], socket: Socket, getLibraryInstance: Libraries['get']) => any[] | Promise<any[]>
    /**
     * Called when a client disconnects.
     */
    onDisconnect?: (reason: string, socket: Socket) => void | Promise<void>
  }
}