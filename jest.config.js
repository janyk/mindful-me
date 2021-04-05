module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
  moduleNameMapper: {
    '@functions(.*)$': '<rootDir>/src/functions/$1',
    '@libs(.*)$': '<rootDir>/src/libs/$1',
    '@errors(.*)$': '<rootDir>/src/errors/$1',
  },
}
