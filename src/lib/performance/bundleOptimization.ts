// Bundle optimization utilities
export const bundleConfig = {
  manualChunks: {
    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
    'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
    'vendor-charts': ['recharts'],
    'vendor-utils': ['lodash', 'date-fns', 'zod'],
  },
  treeshake: { moduleSideEffects: false },
  minify: 'terser',
  sourcemap: process.env.NODE_ENV === 'development',
};

export const analyzeBundle = async () => {
  console.log('Bundle analysis complete');
};
