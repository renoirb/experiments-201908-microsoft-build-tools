/**
 * Monorepo TypeScript Rollup setup.
 *
 * See also:
 * - https://areknawo.com/full-blown-monorepo-setup-walkthrough/
 * - https://github.com/ezolenko/rollup-plugin-typescript2
 * - https://github.com/ezolenko/rollup-plugin-typescript2/issues/72#issuecomment-379838854
 * - https://github.com/zerkalica/zerollup
 * - https://github.com/zerkalica/zerollup/blob/master/packages/rollup-preset-ts/src/index.ts
 * - https://github.com/zerkalica/zerollup/blob/master/packages/helpers/src/getPackageSet.ts
 *
 * Ensure @zerollup/* dependencies matches:
 * - https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/rollup-preset-ts/package.json
 */

const typescript = require('typescript');

const {
  getMonorepoRootAndPackageContents,
  packageIsMonorepoPackageName,
  log,
  formatPath,
} = require('@frontend-bindings/bundling-config');

// https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/ts-transform-paths/src/index.ts
// const transformPaths = require('@zerollup/ts-transform-paths')

/**
 * TypeScript Rollup Plugin Config
 *
 * See {@link https://github.com/ezolenko/rollup-plugin-typescript2/blob/0.22.1/dist/ioptions.d.ts}
 * @type {import('rollup-plugin-typescript2').IOptions}
 */
const rollupTypeScriptPluginDefaults = {
  // https://github.com/ezolenko/rollup-plugin-typescript2/issues/148
  rollupCommonJSResolveHack: true,
  // https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/rollup-preset-ts/src/index.ts#L89
  useTsconfigDeclarationDir: true,
  typescript,
  // transformers: [service => transformPaths(service.getProgram())],
};

/**
 * biliRollupPluginTypeScriptSetup
 *
 * Factory function to merge TypeScript Rollup Config
 *
 * Pretty much the same as:
 * - https://github.com/egoist/bili/blob/master/src/types.ts#L65
 * - https://github.com/egoist/bili/blob/master/src/index.ts#L151
 *
 * @type {() => import('bili').Config}
 */
const main = (
  /** @type {import('bili').Options.rootDir} */
  rootDir
) => {
  const { DEBUG = undefined } = process.env;
  const verbosity = DEBUG && DEBUG.length > 1 ? 3 : 0;

  const { rootPkg, pkg } = getMonorepoRootAndPackageContents(rootDir);

  // https://github.com/egoist/bili/blob/master/bili.config.ts#L11
  // Hint: rpt2_cache stands for Rollup Plugin TypeScript (2), because Bili uses rollup-plugin-typescript2; rpt2
  const cacheRoot = formatPath(rootPkg.path, '.rpt2_cache');

  log(`biliCreateExtendRollupConfig(${rootDir})`, { rootPkg, pkg, cacheRoot });

  /**
   * Should we want to Extend Rollup Config within Bili
   *
   * Refer to Bili's ExtendRollupConfig options:
   * - https://bili.egoist.sh/api/globals.html#extendrollupconfig
   * - https://bili.egoist.sh/api/interfaces/rollupconfig.html
   * - https://bili.egoist.sh/api/interfaces/rollupinputconfig.html
   * - https://bili.egoist.sh/api/interfaces/rollupoutputconfig.html
   */
  // /** @type {(import('bili').RollupConfig) => import('bili').RollupConfig} */
  // function extendRollupConfig (
  //   /** @type {import('bili').RollupConfig} */
  //   opts
  // ) {
  //   const { inputConfig = {}, outputConfig = {}, ...restOpts } = opts
  //   /** @type {import('bili').RollupConfig} */
  //   const out = {
  //     inputConfig: {
  //       ...inputConfig,
  //     },
  //     outputConfig: {
  //       ...outputConfig,
  //     },
  //     ...restOpts,
  //   }
  //   return out
  // }

  /**
   * Doing almost the same as @zerollup/rollup-preset-ts for `{ compilerOptions }` (...continued)
   *
   * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/rollup-preset-ts/src/index.ts#L95
   * https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/helpers/src/getPackageSet.ts#L93
   *
   * @type {import('typescript').CompilerOptions}
   */
  const compilerOptions = {
    baseUrl: rootPkg.path,
    paths: {
      [pkg.json.name]: [pkg.srcDir],
    },
    rootDir: pkg.srcDir,
  };
  if (packageIsMonorepoPackageName(pkg.json.name) && rootPkg.path) {
    // https://github.com/zerkalica/zerollup/blob/v1.7.3/packages/helpers/src/getPackageSet.ts#L137
    const prefix = String(pkg.json.name).split('/')[0] + '/*';
    compilerOptions.paths[prefix] = [
      `${pkg.srcDir.substring(rootPkg.path.length + 1)}/*`,
    ];
  }
  if (pkg.isLib && typeof pkg.declarationDir === 'string') {
    compilerOptions.declaration = pkg.isLib;
    compilerOptions.declarationDir = pkg.declarationDir;
  }

  const tsconfigOverride = {
    compilerOptions,
    include: [pkg.path],
  };

  /**
   * Format Bili Rollup Plugin as it is expected (i.e. use typescript2 HashMap key)
   * @type {import('rollup-plugin-typescript2').IOptions}
   */
  const typescript2 = {
    ...rollupTypeScriptPluginDefaults,
    cacheRoot,
    tsconfigOverride,
    verbosity,
  };

  /** @type {import('bili').Config} */
  return {
    // extendRollupConfig,
    plugins: { typescript2 },
  };
};

module.exports = main;
