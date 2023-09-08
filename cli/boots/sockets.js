var Imports = class {
  a = "./configProfiles.js";
  c = "./controllers.js";
  d = "./libs.js";
  e = "./models.js";
  get configProfiles() {
    const e = require(this.a), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get socketsControllers() {
    const e = require(this.c), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get libs() {
    const e = require(this.d), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get models() {
    const e = require(this.e), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
};
var imports = new Imports();
var import_core = require("phoenix-js/core");
var import_web_sockets = require("phoenix-js/web-sockets");
(async () => {
  const { configProfiles, socketsControllers, libs, models } = imports;
  const configManager = new import_core.ConfigManager(configProfiles);
  const libraryManager = new import_core.LibraryManager(configManager, libs);
  await libraryManager.initialize();
  const modelManager = new import_core.ModelManager(models, libraryManager);
  await modelManager.initialize();
  const phoenixSocketsConfig = configManager.getConfig("phoenixSocketsConfig");
  await import_web_sockets.initSocketsServer({ modelManager, libraryManager, socketsControllers, phoenixSocketsConfig, onError: (error) => console.error(error) });
})();