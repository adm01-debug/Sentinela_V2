#!/usr/bin/env node

/**
 * Lighthouse CI Runner Script
 * 
 * This script runs Lighthouse CI locally with the configuration
 * defined in lighthouserc.js
 * 
 * Usage:
 *   npm run lighthouse
 *   npm run lighthouse:ci
 * 
 * Requirements:
 *   - Chrome/Chromium installed
 *   - App running on localhost:8080 (or run with --startServerCommand)
 */

const { execSync } = require('child_process');
const path = require('path');

const configPath = path.join(__dirname, '..', 'lighthouserc.js');

// Check if we should run in CI mode
const isCI = process.env.CI === 'true' || process.argv.includes('--ci');

console.log('🔦 Starting Lighthouse CI...\n');

try {
  // Build the app first if not in CI (CI should have pre-built)
  if (!isCI && !process.argv.includes('--skip-build')) {
    console.log('📦 Building application...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Run LHCI collect
  console.log('\n📊 Collecting Lighthouse metrics...');
  execSync(`npx @lhci/cli collect --config=${configPath}`, {
    stdio: 'inherit',
    env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH },
  });

  // Run LHCI assert
  console.log('\n✅ Asserting performance thresholds...');
  execSync(`npx @lhci/cli assert --config=${configPath}`, {
    stdio: 'inherit',
  });

  // Upload results (if not in local mode)
  if (isCI || process.argv.includes('--upload')) {
    console.log('\n📤 Uploading results...');
    execSync(`npx @lhci/cli upload --config=${configPath}`, {
      stdio: 'inherit',
    });
  }

  console.log('\n✨ Lighthouse CI completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Lighthouse CI failed:', error.message);
  process.exit(1);
}
