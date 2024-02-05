declare global {
  namespace PhoenixJS {
    namespace Controllers {
      type ModelsModule = typeof import('models')
      function ModelDecorator(nameLibrary: keyof ModelsModule): (target: Object, propertyKey: string) => void
      type ModelDecorator = typeof ModelDecorator
      function PrefixDecorator(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => void
      type PrefixDecorator = typeof PrefixDecorator
    }
  }
}

export { }