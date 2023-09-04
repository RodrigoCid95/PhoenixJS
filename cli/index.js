#!/usr/bin/env node
'use strict';
(async (args) => {
  const command = args.shift()
  if (command) {
    const fs = require('fs')
    const path = require('path')
    const { Flags } = require('./../core')
    const flags = new Flags()
    const mainDir = path.resolve(process.cwd())
    const packagePath = path.join(mainDir, 'package.json')
    const tsConfigPath = path.join(mainDir, 'tsconfig.json')
    const pack = require(packagePath)
    const external = [...Object.keys(pack.dependencies || { 'phoenix': null }), ...Object.keys(pack.devDependencies || { 'phoenix': null })]
    const phoenixSettings = pack.phoenix || {}
    const type = phoenixSettings.type || flags.get('type') || 'http'
    const boot = phoenixSettings.boot || 'auto'
    const releaseDir = (phoenixSettings.releaseDir && typeof phoenixSettings.releaseDir === 'string') ? path.resolve(mainDir, phoenixSettings.releaseDir) : path.join(mainDir, '.release')
    const distDir = (command === 'build') ? path.join(releaseDir, 'server') : path.join(mainDir, '.debugger')

    if (fs.existsSync(distDir)) {
      fs.rmSync((command === 'build') ? releaseDir : distDir, { recursive: true, force: true })
    }

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

    const modules = [
      { input: path.join(mainDir, 'config', 'index.ts'), output: path.join(distDir, 'configProfiles.js') },
      { input: path.join(mainDir, 'libraries', 'index.ts'), output: path.join(distDir, 'libs.js') },
      { input: path.join(mainDir, 'models', 'index.ts'), output: path.join(distDir, 'models.js') }
    ]
    if (type === 'http' || type === 'http-sockets') {
      modules.push({ input: path.join(mainDir, 'controllers', 'http.ts'), output: path.join(distDir, 'httpControllers.js') })
    }
    if (type === 'sockets' || type === 'http-sockets') {
      modules.push({ input: path.join(mainDir, 'controllers', 'sockets.ts'), output: path.join(distDir, 'socketsControllers.js') })
    }
    if (boot === 'manual') {
      modules.push({ input: path.join(mainDir, 'main.ts'), output: path.join(distDir, 'main.js'), inject: [path.resolve(__dirname, 'imports.js')] })
    }

    modules.forEach(({ input }) => {
      if (!fs.existsSync(input)) {
        fs.writeFileSync(input, '', { encoding: 'utf8' })
      }
    })

    let isRunning = false
    let compute = null
    const initServer = () => {
      log('Iniciando servidor...')
      const { fork } = require('child_process')
      const serverPath = boot === 'auto' ? path.resolve(__dirname, 'server.js') : path.join(distDir, 'main.js')
      compute = fork(serverPath, boot === 'auto' ? ['--type', type, '--distDir', distDir, ...args] : args)
      compute.on('message', log)
      compute.on('error', console.error)
    }
    const esbuild = require('esbuild')
    const results = await Promise.all(modules.map(({ input, output, inject = [] }) => {
      const opts = {
        entryPoints: [input],
        outfile: output,
        external,
        bundle: true,
        target: 'node18',
        format: 'cjs',
        platform: 'node',
        tsconfig: tsConfigPath,
        sourcemap: true,
        color: true,
        inject,
        plugins: []
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
      const watchs = []
      for (const result of results) {
        watchs.push(await result.watch())
      }
      await Promise.any(results)
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
        dependencies: {
          ...(pack.dependencies || {}),
          'phoenix-js': 'file:./phoenix'
        },
        licence: pack.licence || 'ISC'
      }
      if (type === 'http' || type === 'http-sockets') {
        newPackage.dependencies['express'] = '^4.18.2'
      }
      if (type === 'sockets' || type === 'http-sockets') {
        newPackage.dependencies['socket.io'] = '^4.7.2'
      }
      const rootdir = path.resolve(distDir, '..')
      fs.writeFileSync(path.join(rootdir, 'package.json'), JSON.stringify(newPackage, null, '\t'), { encoding: 'utf8' })
      const phoenixPath = path.join(rootdir, 'phoenix')
      if (fs.existsSync(phoenixPath)) {
        fs.rmSync(phoenixPath, { recursive: true, force: true })
      }
      fs.mkdirSync(phoenixPath)
      await esbuild.build({
        entryPoints: [path.resolve(__dirname, '..', 'core', 'index.js')],
        outfile: path.join(phoenixPath, 'core.js')
      })
      if (type === 'http' || type === 'http-sockets') {
        await esbuild.build({
          entryPoints: [path.resolve(__dirname, '..', 'http', 'index.js')],
          outfile: path.join(phoenixPath, 'http.js')
        })
      }
      if (type === 'sockets' || type === 'http-sockets') {
        await esbuild.build({
          entryPoints: [path.resolve(__dirname, '..', 'web-sockets', 'index.js')],
          outfile: path.join(phoenixPath, 'web-sockets.js')
        })
      }
      const publicPaths = phoenixSettings['public-paths'] || []
      for (const publicPath of publicPaths) {
        const srcDir = path.join(mainDir, publicPath)
        if (fs.existsSync(srcDir)) {
          const destDir = path.join(rootdir, publicPath)
          fs.cpSync(srcDir, destDir, { recursive: true, force: true })
        }
      }
      fs.writeFileSync(path.join(phoenixPath, 'package.json'), JSON.stringify({ name: 'phoenix-js', version: '1.0.0' }), { encoding: 'utf8' })
      if (boot === 'auto') {
        const bootPath = path.join(__dirname, 'boots', `${type}.js`)
        const bootDestDit = path.join(rootdir, 'server', 'main.js')
        fs.copyFileSync(bootPath, bootDestDit)
      }
    }
  } else {
    console.log('Phoenix Framework!\n')
  }
})(process.argv.slice(2))
