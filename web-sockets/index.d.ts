import { AnyClass, LibraryManager, ModelManager } from './../core'
import * as SocketIO from 'socket.io'
import * as http from 'http'
/**
 * Register a new handler for the given event.
 * @param {string} nameEvent Name of the event
 * @returns {void}
 */
export function On(nameEvent: string): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
/**
 * Web socket.
 */
export type Socket = SocketIO.Socket
/**
 * Config sockets server.
 */
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
    onBeforeToAnswer?: (response: any, socket: Socket, getLibraryInstance: LibraryManager['getLibrary']) => any | Promise<any>
    /**
     * Called when a call is made by the customer.
     */
    onANewRequest?: (request: any[], socket: Socket, getLibraryInstance: LibraryManager['getLibrary']) => any[] | Promise<any[]>
    /**
     * Called when a client disconnects.
     */
    onDisconnect?: (reason: string, socket: Socket) => void | Promise<void>
  }
}
/**
 * SocketIO server.
 */
export type IO = SocketIO.Server
export function Prefix(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => {
  new(...args: any[]): { prefix: string; };
} & T
export type OptionsSocketsServer = {
  http?: http.Server
  modelManager: ModelManager
  libraryManager: LibraryManager
  socketsControllers: AnyClass
  phoenixSocketsConfig?: PhoenixSocketsConfig
  onError?: (error: any) => void
}
export function initSocketsServer(options: OptionsSocketsServer): void