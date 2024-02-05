declare global {
  namespace PhoenixJS {
    namespace Libraries {
      type ConfigModule = typeof import("config")
      class Configs {
        get<K extends keyof ConfigModule>(name: K): ConfigModule[K]
      }
    }
  }
}

export {}