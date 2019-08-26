const babelConfig = require('@frontend-bindings/bundling-config/bili-babel');

module.exports = {
  globals: {
    'ts-jest': {
      extends: babelConfig,
    },
  },
  moduleFileExtensions: ['ts', 'tsx'],
  testMatch: ['**/*.test.+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
