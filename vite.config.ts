import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Note: cast to any so Vitest's `test` block can live in vite config without pulling vitest types
export default defineConfig(({ mode: _mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-i18next',
      'i18next',
      'framer-motion',
      '@supabase/supabase-js',
      'zustand',
    ],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/react-query',
      'react-router-dom',
      'react-i18next',
      'i18next',
      'framer-motion',
      'zustand',
      '@supabase/supabase-js',
    ],
    force: true,
  },
  ...({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  } as Record<string, unknown>),
  server: {
    port: 8081,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) exige função, não objeto, em manualChunks — mesmos 7
        // grupos de antes, mesma lista de pacotes por grupo.
        manualChunks(id: string) {
          const grupos: Record<string, string[]> = {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-ui': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
            'vendor-charts': ['recharts'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-pdf': ['jspdf', 'jspdf-autotable'],
            'vendor-i18n': ['i18next', 'react-i18next'],
          };
          for (const [chunk, pacotes] of Object.entries(grupos)) {
            if (pacotes.some((pacote) => id.includes(`/node_modules/${pacote}/`))) {
              return chunk;
            }
          }
        },
      },
    },
  },
}));
