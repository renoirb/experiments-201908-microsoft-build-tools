/**
 * Lerna related packages
 *
 * Kudos to github.com/zerkalica/zerorollup
 *
 * https://github.com/zerkalica/zerollup/blob/master/packages/helpers/src/getPackageSet.ts
 */

var path = require('path');
const { readFileSync, existsSync, accessSync } = require('fs');
var fsExtra = require('fs-extra');

// Copy-Pasta from TypeScript
// Signature: pathExistsUpLoop([config, exists, step])
function pathExistsUpLoop(_a) {
  var config = _a[0],
    exists = _a[1],
    step = _a[2];
  if (exists) return config;
  var newStep = step - 1;
  if (newStep <= 0) return;
  var newConfig = path.join(
    path.dirname(path.dirname(config)),
    path.basename(config)
  );
  return pathExistsUp(newConfig, newStep);
}
function pathExistsUp(config, step) {
  if (step === void 0) {
    step = 3;
  }
  return Promise.all([config, existsSync(config), step]).then(pathExistsUpLoop);
}
function getLernaPackages(repoRoot) {
  return pathExistsUp(path.join(repoRoot, 'lerna.json')).then(function(
    configFile
  ) {
    return configFile
      ? readFileSync
          .readJson(configFile)
          .then(function(data) {
            return globby(
              path.dirname(configFile) +
                '/' +
                (data.packages || 'packages/*') +
                '/package.json',
              { absolute: true }
            );
          })
          .then(function(pkgFiles) {
            return { pkgFiles: pkgFiles, repoRoot: path.dirname(configFile) };
          })
      : undefined;
  });
}
function getGlobals(pkgs) {
  return pkgs.reduce(function(acc, _a) {
    var name = _a.json.name,
      globalName = _a.globalName;
    acc[name] = globalName;
    return acc;
  }, {});
}
function getAliases(_a) {
  var packages = _a.packages,
    _b = _a.pkg,
    _c = _b.json,
    name = _c.name,
    rollup = _c.rollup,
    srcDir = _b.srcDir,
    env = _a.env;
  var aliases = (packages || []).reduce(function(acc, _a) {
    var _b = _a.json,
      module = _b.module,
      name = _b.name,
      main = _b.main,
      pkgPath = _a.pkgPath;
    var _c;
    var modPath = module || main;
    return modPath
      ? __assign(
          {},
          acc,
          ((_c = {}),
          (_c[name] = path.join(path.dirname(pkgPath), modPath)),
          _c)
        )
      : acc;
  }, {});
  if (srcDir) {
    aliases[name] = srcDir;
    aliases['~'] = srcDir;
  }
  if (env === 'production')
    (rollup.productionStubs || []).forEach(function(stub) {
      return (aliases[stub] = 'empty/object');
    });
  return aliases;
}
function sortPackages(_a, _b) {
  var p1 = _a.json;
  var p2 = _b.json;
  var deps1 = __assign(
    {},
    p1.dependencies,
    p1.devDependencies,
    p1.peerDependencies
  );
  var deps2 = __assign(
    {},
    p2.dependencies,
    p2.devDependencies,
    p2.peerDependencies
  );
  if (deps1[p2.name] || p1.name > p2.name) return 1;
  if (deps2[p1.name] || p1.name < p2.name) return -1;
  return 0;
}

module.exports = {
  getLernaPackages,
  pathExistsUp,
  getGlobals,
  getAliases,
  sortPackages,
};
