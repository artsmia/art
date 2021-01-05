/** @format */
// from https://github.com/vercel/next.js/blob/canary/examples/with-jest/jest.config.js

module.exports = {
  roots: ['<rootDir>'],
  moduleDirectories: ['node_modules', '.'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
  },
}
