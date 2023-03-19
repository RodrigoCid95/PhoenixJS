var Imports = class {
  a = "./configProfiles.js";
  b = "./httpControllers.js";
  c = "./socketsControllers.js";
  d = "./libs.js";
  e = "./models.js";
  get configProfiles() {
    const e = require(this.a), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get httpControllers() {
    const e = require(this.b), r = {};
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
var import_http = require("phoenix-js/http");
(async () => {
  const { configProfiles, httpControllers, libs, models } = imports;
  const configManager = new import_core.ConfigManager(configProfiles);
  const libraryManager = new import_core.LibraryManager(configManager, libs);
  await libraryManager.build((message) => console.error(message));
  const modelManager = new import_core.ModelManager(models, libraryManager);
  const phoenixHttpConfig = configManager.getConfig("phoenixHttpConfig");
  (0, import_http.initHttpServer)({ modelManager, httpControllers, phoenixHttpConfig, onMessage: (message) => console.log(message) });
})();