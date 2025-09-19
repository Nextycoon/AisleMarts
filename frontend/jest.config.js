module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  moduleFileExtensions: ['ts','tsx','js'],
  testPathIgnorePatterns: ['/node_modules/','/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-.*)/)'
  ]
};
