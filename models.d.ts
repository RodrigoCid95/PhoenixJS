type LibrariesModule = typeof import("libraries")
export declare class Libraries {
  get<K extends keyof LibrariesModule>(name: K): LibrariesModule[K]
  get<T = {}>(name: keyof LibrariesModule): T
}
declare function LibraryDecorator(nameLibrary: keyof LibrariesModule): (target: Object, propertyKey: string) => void
export type LibraryDecorator = typeof LibraryDecorator