import * as SocketIO from 'socket.io'
import * as http from 'http'

declare global {
  namespace PhoenixJS {
    namespace Controllers {
      namespace Sockets {
        function OnDecorator(nameEvent: string): (target: Object, propertyKey: string) => void
        type OnDecorator = typeof OnDecorator
        interface Req<S = any> extends http.IncomingMessage {
          session: S
        }
        interface Socket<S = any> extends SocketIO.Socket {
          readonly request: Req<S>
        }
        type IO = SocketIO.Server
      }
    }
  }
}

export { }