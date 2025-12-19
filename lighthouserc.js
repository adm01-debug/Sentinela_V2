// ============================================================
// LIGHTHOUSE CI CONFIGURATION
// Performance, accessibility, and best practices monitoring
// ============================================================

module.exports = {
  ci: {
    collect: {
      // URL to test
      url: ['http://localhost:8080/', 'http://localhost:8080/auth'],
      
      // Start server command
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      
      // Number of runs per URL
      numberOfRuns: 3,
      
      // Settings
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless --disable-gpu',
      },
    },

    assert: {
      assertions: {
        // Performance
        'categories:performance': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],

        // PWA
        'categories:pwa': 'off',
      },
    },

    upload: {
      // Upload to temporary public storage (can change to LHCI server)
      target: 'temporary-public-storage',
    },

    server: {
      // LHCI server configuration (optional)
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDatabasePath: './.lighthouseci/db.sql',
      // },
    },
  },
};
