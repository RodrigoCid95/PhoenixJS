declare global {
  namespace PhoenixJS {
    namespace Models {
      type LibrariesModule = typeof import("libraries")
      class Libraries {
        get<K extends keyof LibrariesModule>(name: K): LibrariesModule[K]
        get<T = {}>(name: keyof LibrariesModule): T
      }
      function LibraryDecorator(nameLibrary: keyof LibrariesModule): (target: Object, propertyKey: string) => void
      type LibraryDecorator = typeof LibraryDecorator
    }
  }
}

export { }