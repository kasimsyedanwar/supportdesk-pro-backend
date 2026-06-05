import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/**/*.routes.ts',
    '!src/**/*.controller.ts',
    '!src/types/**',
    '!src/scripts/**',
  ],
  coverageDirectory: 'coverage',
};

export default config;
