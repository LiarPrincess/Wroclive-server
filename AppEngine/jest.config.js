module.exports = {
  roots: [
    '<rootDir>/src',
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*\\.spec)\\.ts$',
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
  ],
  preset: 'ts-jest',
  testMatch: null,
};
