import * as http from 'http'

declare global {
  namespace PhoenixJS {
    type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>
    class Emitter {
      on<T = undefined>(callback: CallbackEmitter<T>): string
      off(uuid: string): void
      emit<T = {}>(args?: T | undefined): void
    }
    class Emitters {
      static createEmitter(): Emitter
      on<T = undefined>(event: string, callback: CallbackEmitter<T>): string
      off(event: string, uuid: string): void
      emit<T = undefined>(event: string, args?: T | undefined): void
    }
    class Flags {
      get(name: string): string | number | boolean
    }
    function InitHttpServer(options: { onMessage?: (message: string) => void; }): void
    function InitHttpServer(options: { returnInstance?: boolean; onMessage?: (message: string) => void; }): http.Server
    type InitHttpServer = typeof InitHttpServer
    type OptionsSocketsServer = {
      http?: http.Server
      onError?: (error: any) => void
    }
    function InitSocketsServer(options: OptionsSocketsServer): void
    type InitSocketsServer = typeof InitSocketsServer
  }
}