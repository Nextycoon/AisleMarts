module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts','tsx','js','jsx'],
  testPathIgnorePatterns: ['/node_modules/','/e2e/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-.*|expo|@expo|@testing-library/react-native)/)'
  ]
};
