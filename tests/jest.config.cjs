module.exports = {
  preset: 'es-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)'
  ],
  extensionsToTreatAsEsm: ['.js', '.mjs'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};