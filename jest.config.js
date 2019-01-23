// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)'],
  testPathIgnorePatterns: ['node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
  // https://github.com/wallabyjs/public/issues/1541
  // compilers: {
  //   noResolve: false,
  // },
};
