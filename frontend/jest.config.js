module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/tests/**/*.spec.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};