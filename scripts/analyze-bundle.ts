#!/usr/bin/env tsx
/**
 * Analyze bundle size
 * Usage: npx tsx scripts/analyze-bundle.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DIST_DIR = path.join(__dirname, '../dist');

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function analyzeBundle() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Build dist directory not found. Run npm run build first.');
    process.exit(1);
  }

  console.log('
📦 Bundle Analysis
');
  
  const files = fs.readdirSync(path.join(DIST_DIR, 'assets'));
  let totalSize = 0;
  
  files.sort((a, b) => {
    const sizeA = fs.statSync(path.join(DIST_DIR, 'assets', a)).size;
    const sizeB = fs.statSync(path.join(DIST_DIR, 'assets', b)).size;
    return sizeB - sizeA;
  });
  
  for (const file of files) {
    const size = fs.statSync(path.join(DIST_DIR, 'assets', file)).size;
    totalSize += size;
    console.log(`${formatSize(size).padStart(10)} ${file}`);
  }
  
  console.log(`
Total: ${formatSize(totalSize)}`);
}

analyzeBundle();
