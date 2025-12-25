/**
 * @fileoverview Jest setup for Sentinela tests
 */

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console to reduce noise
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Global test utilities
global.sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
