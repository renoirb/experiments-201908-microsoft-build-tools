const changeCase = require('change-case');
const cloneDeep = require('lodash.clonedeep');
const { dirname, resolve, join, sep } = require('path');
const { accessSync } = require('fs');
const { packageExtractExternals } = require('./package');

/**
 * Create cached version of a pure function
 *
 * https://github.com/vuejs/vue/blob/2.6/dist/vue.runtime.esm.js#L150
 *
 * @param {Function} fn
 */
function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

const checkDirExist = path => {
  // log(`checkDirExist("${path}")`)
  accessSync(resolve(path));
};

const log = (...args) => {
  if ('DEBUG' in process.env && process.env.DEBUG.length > 0) {
    console.log(...args);
  }
};

/**
 * @param {string} rootDir
 */
const getMonorepoRootAndPackageContents = rootDir => {
  const pkgPath = resolve(rootDir);
  const rootPkgPath = dirname(dirname(resolve(rootDir)));

  const monorepoPackagePath = resolve(`${pkgPath}/package.json`);
  const monorepoRootPackagePath = resolve(`${rootPkgPath}/package.json`);
  const monorepoRootLernaPath = resolve(`${rootPkgPath}/lerna.json`);

  try {
    accessSync(monorepoPackagePath);
    accessSync(monorepoRootPackagePath);
    accessSync(monorepoRootLernaPath);
  } catch (e) {
    const message = `, we should be at a monorepo package. We cannot find it. We cannot continue.`;
    e.message += message;
    throw new Error(e);
  }

  /** @type {import('@schemastore/package')} */
  const pkgJson = cloneDeep(require(monorepoPackagePath));
  const isLib = Reflect.has(pkgJson, 'typings');
  const pkg = {
    path: pkgPath,
    pkgPath: monorepoPackagePath,
    isLib,
    declarationDir: isLib ? formatPath(pkgPath, 'dist/typings') : null,
    srcDir: formatPath(pkgPath, 'src'),
    distDir: formatPath(pkgPath, 'dist'),
    // externals: packageExtractExternals(pkgJson),
  };

  /** @type {import('@schemastore/package')} */
  const rootPkgJson = cloneDeep(require(monorepoRootPackagePath));
  const rootPkg = {
    path: rootPkgPath,
    pkgPath: monorepoRootPackagePath,
    srcDir: formatPath(rootPkgPath, 'src'),
    distDir: formatPath(rootPkgPath, 'dist'),
    // externals: packageExtractExternals(rootPkgJson),
  };

  log(`getMonorepoRootAndPackageContents("${rootDir}")`, { pkg, rootPkg });

  /**
   * Doing almost the same as @zerollup/rollup-preset-ts for `{ compilerOptions }`
   *
   * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/rollup-preset-ts/src/index.ts#L95
   * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/helpers/src/getPackageSet.ts#L93
   */
  return {
    pkg: {
      json: pkgJson,
      ...pkg,
    },
    rootPkg: {
      json: rootPkgJson,
      ...rootPkg,
    },
  };
};

/**
 * Copy-Pasta from normalizeName
 *
 * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/helpers/src/nameHelpers.ts#L25
 *
 * @param {string} name
 */
function normalizeName(name) {
  return name
    .replace(/@/g, '')
    .replace(/[^\w\d_]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Copy-Pasta from normalizeUmdName
 *
 * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/helpers/src/nameHelpers.ts#L37
 *
 * @param {string} name
 */
function normalizeUmdName(name) {
  return changeCase.camelCase(normalizeName(name));
}

/**
 * (Almost) Copy-Pasta from fixPath, but cached
 *
 * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/helpers/src/nameHelpers.ts#L43
 *
 * @param {string} name
 */
const fixPath = cached(p => p.replace(/\//g, sep));

const formatPath = (pkgPath, modPath) => join(dirname(pkgPath), modPath);

module.exports = {
  cached,
  checkDirExist,
  fixPath,
  formatPath,
  getMonorepoRootAndPackageContents,
  log,
  normalizeName,
  normalizeUmdName,
};
