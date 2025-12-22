import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    test: {
      name: 'web',
      root: './src',
      environment: 'jsdom',
      include: ['**/*.test.{ts,tsx}'],
    },
  },
  {
    test: {
      name: 'desktop',
      root: './desktop-agent',
      environment: 'node',
      include: ['**/*.test.ts'],
    },
  },
  {
    test: {
      name: 'mobile',
      root: './mobile-app',
      environment: 'node',
      include: ['**/*.test.{ts,tsx}'],
    },
  },
  {
    test: {
      name: 'e2e',
      root: './e2e',
      include: ['**/*.spec.ts'],
    },
  },
]);
