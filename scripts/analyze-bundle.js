#!/usr/bin/env node
/**
 * Bundle Analyzer Script
 * Analyzes the production build and generates a report
 * 
 * Usage: node scripts/analyze-bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const REPORT_DIR = path.join(__dirname, '..', 'bundle-report');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function analyzeDirectory(dir, prefix = '') {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      results.push(...analyzeDirectory(filePath, `${prefix}${file}/`));
    } else {
      results.push({
        name: `${prefix}${file}`,
        size: stats.size,
        path: filePath,
      });
    }
  }
  
  return results;
}

async function main() {
  log('\n📦 Bundle Analyzer for Sentinela\n', 'cyan');
  
  // Check if dist exists
  if (!fs.existsSync(DIST_DIR)) {
    log('❌ dist/ directory not found. Running build first...\n', 'yellow');
    
    try {
      log('Building production bundle...', 'blue');
      execSync('npm run build', { stdio: 'inherit' });
      log('\n✅ Build completed!\n', 'green');
    } catch (error) {
      log('\n❌ Build failed!', 'red');
      process.exit(1);
    }
  }
  
  // Analyze files
  log('Analyzing bundle...\n', 'blue');
  
  const files = analyzeDirectory(DIST_DIR);
  
  // Group by type
  const groups = {
    js: files.filter(f => f.name.endsWith('.js')),
    css: files.filter(f => f.name.endsWith('.css')),
    html: files.filter(f => f.name.endsWith('.html')),
    images: files.filter(f => /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(f.name)),
    fonts: files.filter(f => /\.(woff|woff2|ttf|eot)$/.test(f.name)),
    other: files.filter(f => !/\.(js|css|html|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/.test(f.name)),
  };
  
  // Calculate totals
  const totals = {};
  for (const [group, groupFiles] of Object.entries(groups)) {
    totals[group] = groupFiles.reduce((sum, f) => sum + f.size, 0);
  }
  
  const totalSize = Object.values(totals).reduce((sum, size) => sum + size, 0);
  
  // Print report
  log('=' .repeat(60), 'cyan');
  log('BUNDLE SIZE REPORT', 'bright');
  log('=' .repeat(60), 'cyan');
  
  log('\n📊 Summary by Type:\n', 'yellow');
  
  const sortedGroups = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  
  for (const [group, size] of sortedGroups) {
    if (size > 0) {
      const percentage = ((size / totalSize) * 100).toFixed(1);
      const bar = '█'.repeat(Math.ceil(percentage / 5));
      log(`  ${group.toUpperCase().padEnd(8)} ${formatBytes(size).padStart(12)} ${percentage.padStart(5)}% ${bar}`, 'reset');
    }
  }
  
  log('\n' + '-'.repeat(60), 'cyan');
  log(`  TOTAL    ${formatBytes(totalSize).padStart(12)}`, 'bright');
  log('-'.repeat(60) + '\n', 'cyan');
  
  // Top 10 largest files
  log('📁 Top 10 Largest Files:\n', 'yellow');
  
  const sortedFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 10);
  
  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    log(`  ${(i + 1).toString().padStart(2)}. ${file.name.padEnd(40)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`, 'reset');
  }
  
  // Warnings
  log('\n⚠️  Warnings:\n', 'yellow');
  
  const largeJS = groups.js.filter(f => f.size > 500 * 1024);
  if (largeJS.length > 0) {
    log(`  - ${largeJS.length} JS file(s) over 500KB (consider code splitting)`, 'red');
    for (const file of largeJS) {
      log(`      ${file.name}: ${formatBytes(file.size)}`, 'red');
    }
  }
  
  if (totalSize > 5 * 1024 * 1024) {
    log(`  - Total bundle size over 5MB (${formatBytes(totalSize)})`, 'red');
  }
  
  if (largeJS.length === 0 && totalSize <= 5 * 1024 * 1024) {
    log('  ✅ No warnings - bundle size looks good!', 'green');
  }
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

main().catch(console.error);
