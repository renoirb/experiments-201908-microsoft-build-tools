import { Config, ConfigOutput } from 'bili';

const input = 'src/index.ts';

const output: ConfigOutput = {
  // minify: true,
  sourceMap: true,
  target: 'browser',
  format: ['esm', 'cjs'],
};

const plugins = {
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#options
          useBuiltIns: 'usage',
          corejs: 3,
          // See bundling-config/bin/rush-bili
          // targets: {
          //   browsers: 'ie >= 9, > 1%',
          //   node: '0.10'
          // },
          debug: true,
        },
      ],
    ],
  }
};

const config: Config = {
  input,
  banner: true,
  output,
  plugins,
  // bundleNodeModules: true,
  // externals: [],
};

export default config;
