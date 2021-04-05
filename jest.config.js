module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/.jest/setEnvVars.js',"<rootDir>/.jest/config.ts"],
  moduleNameMapper: {
    '@functions(.*)$': '<rootDir>/src/functions/$1',
    '@libs(.*)$': '<rootDir>/src/libs/$1',
    '@errors(.*)$': '<rootDir>/src/errors/$1',
  },
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  globals: {
    "ts-jest": {
      "compiler": "ttypescript"
    }
  }
}
