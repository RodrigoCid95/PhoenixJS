#!/usr/bin/env node
'use strict';
(async (args) => {
  const log = (message) => {
    if (process.stdout.clearLine) {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
    }
    if (process.stdout.write) {
      process.stdout.write(message)
    } else {
      console.log(message)
    }
  }
  const fs = require('node:fs')
  const { paths } = require('./paths')
  const command = args.shift()
  paths.command = command
  const pack = require(paths.packagePath)
  const phoenixSettings = pack.phoenix || {
    type: 'http',
    boot: 'auto',
    resources: []
  }
  if (!phoenixSettings.type) {
    phoenixSettings['type'] = 'http'
  }
  if (!phoenixSettings.boot) {
    phoenixSettings['boot'] = 'auto'
  }
  if (!phoenixSettings.resources) {
    phoenixSettings.resources = []
  }
  pack.phoenix = phoenixSettings
  const { type, boot, resources } = phoenixSettings
  paths.type = type
  if (phoenixSettings.releaseDir && typeof phoenixSettings.releaseDir === 'string') {
    paths.releaseDir = phoenixSettings.releaseDir
  }
  const modules = [
    { input: paths.modules.inputs.emitters, output: paths.modules.outputs.emitters },

    { input: paths.modules.inputs.configurations, output: paths.modules.outputs.configurations, inject: [paths.modules.injects.emitters] },
    { input: paths.modules.inputs.configs, output: paths.modules.outputs.configs },

    { input: paths.modules.inputs.libraries, output: paths.modules.outputs.libraries, inject: [paths.modules.injects.libraries, paths.modules.injects.emitters] },
    { input: paths.modules.inputs.libs, output: paths.modules.outputs.libs },

    { input: paths.modules.inputs.models, output: paths.modules.outputs.models, inject: [paths.modules.injects.models, paths.modules.injects.emitters] },
    { input: paths.modules.inputs.modls, output: paths.modules.outputs.modls }
  ]

  if (type.includes('http')) {
    modules.push({ input: type.includes('sockets') ? paths.modules.inputs.httpControllers : paths.modules.inputs.controllers, output: paths.modules.outputs.httpControllers, inject: [paths.modules.injects.controller, paths.modules.injects.http, paths.modules.injects.emitters] })
    modules.push({ input: paths.modules.inputs.http, output: paths.modules.outputs.http })
  }
  if (type.includes('sockets')) {
    modules.push({ input: type.includes('http') ? paths.modules.inputs.socketsControllers : paths.modules.inputs.controllers, output: paths.modules.outputs.socketsControllers, inject: [paths.modules.injects.controller, paths.modules.injects.sockets, paths.modules.injects.emitters] })
    modules.push({ input: paths.modules.inputs.sockets, output: paths.modules.outputs.sockets })
  }

  const mainInject = [paths.modules.injects.main]
  if (type.includes('http')) {
    mainInject.push(paths.modules.injects.mainHttp)
  }
  if (type.includes('sockets')) {
    mainInject.push(paths.modules.injects.mainSockets)
  }
  modules.push({ input: boot === 'manual' ? paths.modules.inputs.main : paths.modules.inputs.autoMain, output: paths.modules.outputs.main, inject: mainInject })

  if (command) {
    const external = [...Object.keys(pack.dependencies || { 'phoenix': null }), ...Object.keys(pack.devDependencies || { 'phoenix': null })]

    const destDir = command === 'build' ? paths.releaseDir : paths.distDir
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true })
    }

    let isRunning = false
    let compute = null
    const initServer = () => {
      log('Iniciando servidor...')
      const { fork } = require('node:child_process')
      compute = fork(paths.modules.outputs.main, boot === 'auto' ? ['--type', type, ...args] : args)
      compute.on('message', log)
      compute.on('error', console.error)
    }
    const esbuild = require('esbuild')
    let plugins = []
    if (fs.existsSync(paths.pluginsDir) || fs.existsSync(`${paths.pluginsPath}.js`)) {
      const temp = require(paths.pluginsPath)
      if (Array.isArray(temp)) {
        plugins = temp
      }
    }
    const builders = await Promise.all(modules.map(({ input, output, inject = [] }) => {
      const opts = {
        entryPoints: [input],
        outfile: output,
        external,
        bundle: true,
        target: 'node18',
        format: 'cjs',
        platform: 'node',
        tsconfig: paths.tsConfigPath,
        sourcemap: true,
        color: true,
        inject,
        treeShaking: true,
        plugins,
        banner: {
          js: `const isRelease = ${command === 'start' ? 'false' : 'true'};\nconst isDebugger = ${command === 'start' ? 'true' : 'false'};`
        }
      }
      if (phoenixSettings.loader) {
        opts.loader = phoenixSettings.loader
      }
      if (command === 'start') {
        opts.plugins.push({
          name: 'watching',
          setup(build) {
            build.onEnd(result => {
              if (isRunning) {
                if (!compute?.killed) {
                  compute.kill()
                  log('Servidor detenido!')
                }
                if (result.errors.length === 0) {
                  initServer()
                }
              }
            })
          }
        })
        return esbuild.context(opts)
      }
      return esbuild.build(opts)
    }))
    if (command === 'start') {
      const watches = []
      for (const result of builders) {
        watches.push(await result.watch())
      }
      await Promise.all(watches)
      initServer()
      isRunning = true
    } else {
      const newPackage = {
        name: pack.name || 'gorila-server',
        version: pack.version || '1.0.0',
        description: pack.description || '',
        main: './server/main.js',
        scripts: {
          start: 'node .'
        },
        dependencies: pack.dependencies || {},
        license: pack.license || 'ISC'
      }
      fs.writeFileSync(paths.packageReleasePath, JSON.stringify(newPackage, null, '\t'), { encoding: 'utf-8' })
      for (const resource of resources) {
        const srcDir = paths.resources.root(resource)
        if (fs.existsSync(srcDir)) {
          const destDir = paths.resources.release(resource)
          fs.cpSync(srcDir, destDir, { recursive: true, force: true })
        }
      }
    }
  } else {
    if (!pack.scripts) {
      pack.scripts = {}
    }
    if (!pack.scripts.start) {
      pack.scripts.start = 'phoenix start'
    }
    if (!pack.scripts.build) {
      pack.scripts.build = 'phoenix build'
    }
    const install = (name, dev = false) => {
      const { execSync } = require('child_process')
      const result = execSync(`npm i ${name}${dev ? ' -D' : ''}`, { encoding: 'utf-8', cwd: paths.mainDir })
      console.log(result)
    }
    if (!pack.dependencies) {
      pack.dependencies = {}
    }
    if (!pack.devDependencies) {
      pack.dependencies = {}
    }
    fs.writeFileSync(paths.packagePath, JSON.stringify(pack, null, '\t'), { encoding: 'utf-8' })
    const dependencies = Object.keys(pack.dependencies)
    if (!dependencies.includes('express')) {
      log('Instalando ExpressJS ...')
      install('express')
      install('@types/express', true)
    }
    if (!dependencies.includes('socket.io')) {
      log('Instalando Socket.IO ...')
      install('socket.io')
    }
    const devDependencies = Object.keys(pack.devDependencies)
    if (!devDependencies.includes('@types/node')) {
      log('Instalando @types/node ...')
      install('@types/node', true)
    }
    if (!fs.existsSync(paths.declarations)) {
      fs.writeFileSync(paths.declarations, "import 'phoenix-js'\nimport 'phoenix-js/config/http'\nimport 'phoenix-js/config/sockets'\nimport 'phoenix-js/libraries'\nimport 'phoenix-js/models'\nimport 'phoenix-js/controllers'\nimport 'phoenix-js/controllers/http'\nimport 'phoenix-js/controllers/sockets'", { encoding: 'utf-8' })
    }
    log('Phoenix Framework!\n')
  }
})(process.argv.slice(2))