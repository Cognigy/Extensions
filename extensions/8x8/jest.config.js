/**
 * @type {import('ts-jest').JestConfigWithTsJest}
*/
module.exports = {
  preset: 'ts-jest',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}'
  ],
}
