type ConfigModule = typeof import("config")
export declare class Configs {
  get<K extends keyof ConfigModule>(name: K): ConfigModule[K]
}