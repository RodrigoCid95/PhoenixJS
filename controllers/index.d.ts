type ModelsModule = typeof import('models')
declare function ModelDecorator(nameLibrary: keyof ModelsModule): (target: Object, propertyKey: string) => void
export type ModelDecorator = typeof ModelDecorator
declare function PrefixDecorator(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => void
export type PrefixDecorator = typeof PrefixDecorator