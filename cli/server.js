#!/usr/bin/env node
'use strict';
(async function () {
  //#region Declarations
  
  const path = require('path')
  const { Flags, ConfigManager, LibraryManager, ModelManager } = require('./../core')
  const flags = new Flags()
  const distDir = flags.get('distDir')
  const configPath = path.join(distDir, 'configProfiles')
  const profiles = require(configPath)
  const configManager = new ConfigManager(profiles)
  const typeServer = flags.get('type')

  //#endregion
  //#region Libraries

  const initsPath = path.join(distDir, 'libs')
  const inits = require(initsPath)
  const libraryManager = new LibraryManager(configManager, inits)
  await libraryManager.initialize(message => process.send(message))

  //#endregion
  //#region Models

  const modelsPath = path.join(distDir, 'models')
  const modelClasses = require(modelsPath)
  const modelManager = new ModelManager(modelClasses, libraryManager)
  await modelManager.initialize(message => process.send(message))

  //#endregion
  //#region Server

  if (typeServer === 'http') {
    const { initHttpServer } = require('./../http')
    const httpControllers = require(`${distDir}/controllers`)
    initHttpServer({
      modelManager,
      httpControllers,
      phoenixHttpConfig: configManager.getConfig('phoenixHttpConfig'),
      onMessage: message => process.send(message)
    })
  } else if (typeServer === 'sockets') {
    const { initSocketsServer } = require('./../web-sockets')
    const socketsControllers = require(`${distDir}/controllers`)
    initSocketsServer({
      modelManager,
      libraryManager,
      socketsControllers,
      phoenixSocketsConfig: configManager.getConfig('phoenixSocketsConfig'),
      onError: error => process.send(error)
    })
  } else if (typeServer === 'http-sockets') {
    const { initHttpServer } = require('./../http')
    const httpControllers = require(`${distDir}/httpControllers`)
    const socketsControllers = require(`${distDir}/socketsControllers`)
    const http = initHttpServer({
      returnInstance: true,
      modelManager,
      httpControllers,
      phoenixHttpConfig: configManager.getConfig('phoenixHttpConfig'),
      onMessage: message => process.send(message)
    })
    const { initSocketsServer } = require('./../web-sockets')
    initSocketsServer({
      http,
      modelManager,
      libraryManager,
      socketsControllers,
      phoenixSocketsConfig: configManager.getConfig('phoenixSocketsConfig'),
      onError: error => process.send(error)
    })
  } else {
    let message = ''
    if (typeServer === undefined || typeServer === 'undefined') {
      message = 'El valor de "type" no está definido, intenta con http, sockets o http-sockets'
    } else {
      message = 'El valor de "type" no es válido, intenta con http, sockets o http-sockets'
    }
    process.send(message)
  }

  //#endregion
})()
