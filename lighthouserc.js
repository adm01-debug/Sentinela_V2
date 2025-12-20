// ============================================================
// LIGHTHOUSE CI CONFIGURATION
// Performance, accessibility, and best practices monitoring
// ============================================================

module.exports = {
  ci: {
    collect: {
      // URLs to test - cover main user flows
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/auth',
        'http://localhost:8080/employees',
        'http://localhost:8080/monitoring',
      ],
      
      // Start server command
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 60000,
      
      // Number of runs per URL for consistent results
      numberOfRuns: 5,
      
      // Settings for desktop and mobile
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
        throttling: {
          // Simulate good 4G connection
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },

    assert: {
      // Aggregate method for multiple runs
      aggregationMethod: 'median-run',
      
      assertions: {
        // ============================================================
        // PERFORMANCE - Core Web Vitals (strict thresholds)
        // ============================================================
        'categories:performance': ['error', { minScore: 0.85, aggregationMethod: 'pessimistic' }],
        
        // First Contentful Paint - should be under 1.8s
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        
        // Largest Contentful Paint - should be under 2.5s (Core Web Vital)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        
        // Cumulative Layout Shift - should be under 0.1 (Core Web Vital)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Total Blocking Time - should be under 300ms (Core Web Vital proxy)
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Speed Index - should be under 3s
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Time to Interactive - should be under 3.8s
        'interactive': ['warn', { maxNumericValue: 3800 }],
        
        // First Input Delay proxy
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],

        // ============================================================
        // ACCESSIBILITY - Must be excellent
        // ============================================================
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        // Specific accessibility audits that should never fail
        'color-contrast': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'meta-viewport': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],

        // ============================================================
        // BEST PRACTICES - Security and modern standards
        // ============================================================
        'categories:best-practices': ['error', { minScore: 0.95 }],
        
        // HTTPS and security
        'is-on-https': ['error', { minScore: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
        
        // Console errors should be zero
        'errors-in-console': ['warn', { minScore: 1 }],
        
        // Image optimization
        'uses-webp-images': ['warn', { minScore: 0.9 }],
        'uses-optimized-images': ['warn', { minScore: 0.9 }],

        // ============================================================
        // SEO - Discoverability
        // ============================================================
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Critical SEO elements
        'meta-description': ['error', { minScore: 1 }],
        'crawlable-anchors': ['error', { minScore: 1 }],
        'robots-txt': ['warn', { minScore: 1 }],
        'canonical': ['warn', { minScore: 1 }],

        // ============================================================
        // PWA - Progressive Web App
        // ============================================================
        'categories:pwa': ['warn', { minScore: 0.7 }],
        
        // Service worker
        'service-worker': ['warn', { minScore: 1 }],
        'installable-manifest': ['warn', { minScore: 1 }],
        
        // ============================================================
        // RESOURCE OPTIMIZATION
        // ============================================================
        // Bundle size warnings
        'total-byte-weight': ['warn', { maxNumericValue: 3000000 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
        'bootup-time': ['warn', { maxNumericValue: 3500 }],
        
        // Unused code
        'unused-javascript': ['warn', { maxNumericValue: 150000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
        
        // Render blocking resources
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
      },
    },

    upload: {
      // Upload to temporary public storage for PR comments
      target: 'temporary-public-storage',
    },

    server: {
      // LHCI server configuration for historical tracking
      // Uncomment and configure for production use
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDatabasePath: './.lighthouseci/db.sql',
      // },
    },
  },
};
