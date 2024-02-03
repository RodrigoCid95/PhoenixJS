declare const isRelease: boolean
declare const flags: any
declare const initHttpServer: any
declare const initSocketsServer: any
const type = flags.get('type')
const log = (message) => {
  if (isRelease) {
    console.log(message)
  } else {
    process.send(message)
  }
}
let http: any = undefined
if (type.includes('http')) {
  http = initHttpServer({ returnInstance: true, onMessage: log })
}
if (type.includes('sockets')) {
  initSocketsServer({ http, onError: log })
}
log('Ready!')