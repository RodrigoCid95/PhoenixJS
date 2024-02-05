const path = require('node:path')
const fs = require('node:fs')

const mainDir = path.resolve(process.cwd())
const declarations = path.join(mainDir, 'declarations.d.ts')
const packagePath = path.join(mainDir, 'package.json')
const tsConfigPath = path.join(mainDir, 'tsconfig.json')
const importsPath = path.resolve(__dirname, 'imports')
const modsPath = path.resolve(__dirname, 'mods')
const pluginsPath = path.join(mainDir, 'plugins')
let releaseDir = '.release'
let command = 'start'

if (!fs.existsSync(tsConfigPath)) {
  const tsconfig = {
    compilerOptions: {
      baseUrl: ".",
      declaration: true,
      emitDeclarationOnly: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      target: "ES6",
      moduleResolution: "Node",
      sourceMap: true,
      strictNullChecks: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      paths: {
        "config/*": ["config/*"],
        "controllers": ["controllers/*"],
        "libraries/*": ["libraries/*"],
        "models/*": ["models/*"]
      }
    }
  }
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsconfig, null, '\t'), { encoding: 'utf-8' })
}
const verifyFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, '', { encoding: 'utf8' })
  }
  return filePath
}

const paths = {
  get mainDir() {
    return mainDir
  },
  get declarations() {
    return declarations
  },
  /**
   * @param {'start' | 'build'} cmd
   */
  set command(cmd) {
    command = cmd
  },
  get packagePath() {
    return packagePath
  },
  get tsConfigPath() {
    return tsConfigPath
  },
  /**
   * @param {string} rd 
   */
  set releaseDir(rd) {
    releaseDir = rd
  },
  get releaseDir() {
    return path.resolve(mainDir, releaseDir)
  },
  resources: {
    root: (resource) => path.join(paths.mainDir, resource),
    release: (resource) => path.join(paths.releaseDir, resource)
  },
  get distDir() {
    return command === 'start' ? path.join(mainDir, '.debugger') : path.join(paths.releaseDir, 'server')
  },
  get packageReleasePath() {
    return path.join(paths.releaseDir, 'package.json')
  },
  modules: {
    inputs: {
      configs: path.join(modsPath, 'configs.ts'),
      libs: path.join(modsPath, 'libs.ts'),
      modls: path.join(modsPath, 'modls.ts'),
      http: path.join(modsPath, 'http.ts'),
      sockets: path.join(modsPath, 'sockets.ts'),
      get configurations() {
        return verifyFile(path.join(mainDir, 'config', 'index.ts'))
      },
      get libraries() {
        return verifyFile(path.join(mainDir, 'libraries', 'index.ts'))
      },
      get models() {
        return verifyFile(path.join(mainDir, 'models', 'index.ts'))
      },
      get controllers() {
        return verifyFile(path.join(mainDir, 'controllers', 'index.ts'))
      },
      get httpControllers() {
        return verifyFile(path.join(mainDir, 'controllers', 'http', 'index.ts'))
      },
      get socketsControllers() {
        return verifyFile(path.join(mainDir, 'controllers', 'sockets', 'index.ts'))
      },
      get main() {
        return verifyFile(path.join(mainDir, 'main.ts'))
      },
      get autoMain() {
        return path.join(modsPath, 'main.ts')
      }
    },
    outputs: {
      get configs() {
        return path.join(paths.distDir, 'config.js')
      },
      get libs() {
        return path.join(paths.distDir, 'libs.js')
      },
      get modls() {
        return path.join(paths.distDir, 'modls.js')
      },
      get http() {
        return path.join(paths.distDir, 'http.js')
      },
      get sockets() {
        return path.join(paths.distDir, 'sockets.js')
      },
      get configurations() {
        return path.join(paths.distDir, 'configurations.js')
      },
      get libraries() {
        return path.join(paths.distDir, 'libraries.js')
      },
      get models() {
        return path.join(paths.distDir, 'models.js')
      },
      get controllers() {
        return path.join(paths.distDir, 'controllers.js')
      },
      get httpControllers() {
        return path.join(paths.distDir, 'httpControllers.js')
      },
      get socketsControllers() {
        return path.join(paths.distDir, 'socketsControllers.js')
      },
      get main() {
        return path.join(paths.distDir, 'main.js')
      },
    },
    injects: {
      get libraries() {
        return path.join(importsPath, 'libraries.js')
      },
      get models() {
        return path.join(importsPath, 'models.js')
      },
      get controller() {
        return path.join(importsPath, 'controllers.js')
      },
      get http() {
        return path.join(importsPath, 'controllers.http.js')
      },
      get sockets() {
        return path.join(importsPath, 'controllers.sockets.js')
      },
      get httpMain() {
        return path.join(importsPath, 'main.http.js')
      },
      get socketsMain() {
        return path.join(importsPath, 'main.sockets.js')
      },
      get emitters() {
        return path.join(importsPath, 'emitters.js')
      },
      get main() {
        return path.join(importsPath, 'main.js')
      },
      get mainHttp() {
        return path.join(importsPath, 'main.http.js')
      },
      get mainSockets() {
        return path.join(importsPath, 'main.sockets.js')
      }
    }
  },
  pluginsPath,
  pluginsDir: path.join(pluginsPath, 'index.js')
}

module.exports.paths = paths