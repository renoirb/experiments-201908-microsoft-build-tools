const { bannerFooterExtract } = require('./banner');
const {
  packageNameToModuleName,
  packageExtractExternals,
} = require('./package');
const setupRollupPlugins = require('./rollup');
const lerna = require('./lerna');

const createInputObjectDescriptor = ({ input = 'src/index.js' }) => {
  const out = {};

  if (typeof input === 'string') {
    return [input];
  }
  if (Array.isArray(input)) {
    for (const fileName of input) {
      const name = fileName
        .replace(/\.[a-z]{2,3}$/gi, '')
        .split('/')
        .pop();
      out[name] = fileName;
    }
  }

  return out;
};

const config = (
  /** @type {import('@schemastore/package')} */
  pkg = {}
) => {
  const externals = packageExtractExternals(pkg);

  /** @type {import('bili').Config} */
  const biliConfig = {
    externals,
    async extendConfig(config, args) {
      console.log(__filename + ' extendConfig config', config);
      console.log(__filename + ' extendConfig args', args);

      const foo = await lerna.getLernaPackages('.');
      console.log('yo', foo);

      let isTypeScript = 'types' in pkg && typeof pkg.types === 'string';

      let { target = 'node', minify = false, format = 'cjs' } = config.output;

      if ('format' in args) {
        format = args.format;
      }

      /** @type {import('@frontend-bindigns/bundling-config').BundlingConfigOptions} */
      let customOptions = {
        isTypeScript,
        format,
        target,
      };

      const { DEBUG = false } = process.env;

      if (!DEBUG) {
        minify = true;
      }

      const moduleName = packageNameToModuleName(pkg.name);
      const rollup = setupRollupPlugins(customOptions);
      const resolvePlugins = rollup.config.resolvePlugins;

      const input = createInputObjectDescriptor(config);
      // console.log(__filename + ' extendConfig input', input)

      const { banner } = bannerFooterExtract(pkg, target, format);

      const output = {
        extractCss: false,
        ...config.output,
        minify,
        format,
        target,
        moduleName,
      };

      /**
       * https://bili.egoist.sh/#/plugins
       * https://github.com/egoist/bili/blob/master/src/index.ts#L158
       */
      const plugins = {
        ...rollup.plugins,
        postcss: false,
      };

      if (isTypeScript) {
        plugins.babel = false;
        // } else {
        //   plugins.babel = {
        //     // Make this project's .babelrc to reach the monorepo root.
        //     rootMode: 'upward',
        //   }
      }

      if (output.extractCss === true) {
        plugins.postcss = true;
      }

      // console.log('hasTypeScriptBundlingConfig', hasTypeScriptBundlingConfig)
      // console.log('plugins', [...Object.keys(plugins)])

      /** @type {import('bili').Config} */
      const extendedConfig = {
        ...config,
        input,
        banner,
        output,
        plugins,
        resolvePlugins,
      };

      // console.log(__filename + ' extendConfig out', extendedConfig)

      return extendedConfig;
    },
  };

  return biliConfig;
};

module.exports = {
  config,
};
