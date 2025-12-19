import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Stories location
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  // Addons
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],

  // Framework
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Documentation
  docs: {
    autodocs: 'tag',
  },

  // TypeScript
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  // Static directories
  staticDirs: ['../public'],

  // Vite configuration
  viteFinal: async (config) => {
    // Add path aliases
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src',
    };

    return config;
  },
};

export default config;
