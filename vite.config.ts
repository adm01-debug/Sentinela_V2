import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  
  // ============================================================
  // BUILD OPTIMIZATION
  // ============================================================
  build: {
    // Aumentar limite de aviso de chunk (150kb)
    chunkSizeWarningLimit: 150,
    
    // Gerar sourcemaps apenas em dev
    sourcemap: mode === 'development',
    
    // Minificação com esbuild (mais rápido que terser)
    minify: 'esbuild',
    
    // Target moderno para menor bundle
    target: 'es2020',
    
    // Rollup options para code splitting
    rollupOptions: {
      output: {
        // ============================================================
        // MANUAL CHUNKS - Separa vendor de app code
        // ============================================================
        manualChunks: {
          // React core - carrega sempre
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Framework - shadcn/radix
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
          ],
          
          // State management & data fetching
          'data-vendor': [
            '@tanstack/react-query',
            '@supabase/supabase-js',
          ],
          
          // Charts - carrega apenas quando necessário
          'charts-vendor': ['recharts'],
          
          // Date utilities
          'date-vendor': ['date-fns'],
          
          // Form validation
          'form-vendor': ['zod', 'react-hook-form', '@hookform/resolvers'],
          
          // Icons - separado por ser grande
          'icons-vendor': ['lucide-react'],
        },
        
        // Naming patterns para cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  
  // ============================================================
  // PLUGINS
  // ============================================================
  plugins: [
    react(),
    
    // Tagging em desenvolvimento
    mode === 'development' && componentTagger(),
    
    // Compression (gzip + brotli)
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    
    // PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Sentinela - Monitoramento',
        short_name: 'Sentinela',
        description: 'Sistema de monitoramento de funcionários',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  
  // ============================================================
  // RESOLVE
  // ============================================================
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // ============================================================
  // OPTIMIZAÇÃO DE DEPENDÊNCIAS
  // ============================================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
}));
