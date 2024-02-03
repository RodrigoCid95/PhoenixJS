import * as http from 'http'
export type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>
export declare class Emitter {
  on<T = undefined>(callback: CallbackEmitter<T>): string
  off(uuid: string): void
  emit<T = {}>(args?: T | undefined): void
}
export declare class Emitters {
  static createEmitter(): Emitter
  on<T = undefined>(event: string, callback: CallbackEmitter<T>): string
  off(event: string, uuid: string): void
  emit<T = undefined>(event: string, args?: T | undefined): void
}
export declare class Flags {
  get(name: string): string | number | boolean
}
declare function InitHttpServer(options: { onMessage?: (message: string) => void; }): void
declare function InitHttpServer(options: { returnInstance?: boolean; onMessage?: (message: string) => void; }): http.Server
export type InitHttpServer = typeof InitHttpServer
export type OptionsSocketsServer = {
  http?: http.Server
  onError?: (error: any) => void
}
declare function InitSocketsServer(options: OptionsSocketsServer): void
export type InitSocketsServer = typeof InitSocketsServer