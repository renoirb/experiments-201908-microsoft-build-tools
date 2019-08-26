module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  modulePathIgnorePatterns: ['dist'],
  notify: true,
  notifyMode: 'always',
  testMatch: ['**/*.test.+(js|jsx)'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  expand: true,
  forceExit: true,
  verbose: true,
};
