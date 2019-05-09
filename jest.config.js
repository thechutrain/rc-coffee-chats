// https://basarat.gitbooks.io/typescript/docs/testing/jest.html

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  testEnvironment: 'node',
  testRegex: '(S?(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      warnOnly: true,
      diagnostics: false
    }
  },
  modulePaths: ['<rootDir>']
};
