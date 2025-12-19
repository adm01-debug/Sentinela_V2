// ============================================================
// BUNDLE ANALYZER SCRIPT
// Analyzes the production bundle and generates reports
// ============================================================

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BundleStats {
  totalSize: number;
  gzipSize: number;
  files: FileStats[];
  timestamp: string;
}

interface FileStats {
  name: string;
  size: number;
  gzipSize: number;
  percentage: number;
}

// Size thresholds (in KB)
const THRESHOLDS = {
  totalBundle: 500,  // 500KB total
  singleChunk: 200,  // 200KB per chunk
  vendor: 300,       // 300KB for vendor chunk
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getGzipSize(filePath: string): number {
  try {
    const result = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf-8' });
    return parseInt(result.trim(), 10);
  } catch {
    return 0;
  }
}

function analyzeBundle(): BundleStats {
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');

  if (!fs.existsSync(assetsPath)) {
    console.error('❌ dist/assets directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter((f) => f.endsWith('.js'));
  const cssFiles = files.filter((f) => f.endsWith('.css'));

  const fileStats: FileStats[] = [];
  let totalSize = 0;
  let totalGzipSize = 0;

  // Analyze JS files
  for (const file of jsFiles) {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const gzipSize = getGzipSize(filePath);

    totalSize += stats.size;
    totalGzipSize += gzipSize;

    fileStats.push({
      name: file,
      size: stats.size,
      gzipSize,
      percentage: 0, // Will calculate after
    });
  }

  // Analyze CSS files
  for (const file of cssFiles) {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const gzipSize = getGzipSize(filePath);

    totalSize += stats.size;
    totalGzipSize += gzipSize;

    fileStats.push({
      name: file,
      size: stats.size,
      gzipSize,
      percentage: 0,
    });
  }

  // Calculate percentages
  for (const file of fileStats) {
    file.percentage = (file.size / totalSize) * 100;
  }

  // Sort by size descending
  fileStats.sort((a, b) => b.size - a.size);

  return {
    totalSize,
    gzipSize: totalGzipSize,
    files: fileStats,
    timestamp: new Date().toISOString(),
  };
}

function printReport(stats: BundleStats) {
  console.log('\n' + '='.repeat(60));
  console.log('📦 BUNDLE ANALYSIS REPORT');
  console.log('='.repeat(60));

  console.log(`\n📅 Generated: ${stats.timestamp}`);
  console.log(`\n📊 SUMMARY`);
  console.log(`   Total Size:     ${formatSize(stats.totalSize)}`);
  console.log(`   Gzipped Size:   ${formatSize(stats.gzipSize)}`);
  console.log(`   Compression:    ${((1 - stats.gzipSize / stats.totalSize) * 100).toFixed(1)}%`);

  console.log(`\n📁 FILES (${stats.files.length} total)`);
  console.log('-'.repeat(60));

  for (const file of stats.files) {
    const bar = '█'.repeat(Math.round(file.percentage / 2));
    const warning = file.size > THRESHOLDS.singleChunk * 1024 ? ' ⚠️' : '';
    
    console.log(`   ${file.name}`);
    console.log(`   ${bar} ${file.percentage.toFixed(1)}%`);
    console.log(`   Size: ${formatSize(file.size)} | Gzip: ${formatSize(file.gzipSize)}${warning}`);
    console.log('');
  }

  // Warnings
  console.log('\n⚠️  WARNINGS');
  console.log('-'.repeat(60));

  let hasWarnings = false;

  if (stats.totalSize > THRESHOLDS.totalBundle * 1024) {
    console.log(`   ❌ Total bundle exceeds ${THRESHOLDS.totalBundle}KB threshold`);
    hasWarnings = true;
  }

  for (const file of stats.files) {
    if (file.size > THRESHOLDS.singleChunk * 1024 && !file.name.includes('vendor')) {
      console.log(`   ❌ ${file.name} exceeds ${THRESHOLDS.singleChunk}KB`);
      hasWarnings = true;
    }
    if (file.name.includes('vendor') && file.size > THRESHOLDS.vendor * 1024) {
      console.log(`   ❌ Vendor chunk exceeds ${THRESHOLDS.vendor}KB`);
      hasWarnings = true;
    }
  }

  if (!hasWarnings) {
    console.log('   ✅ No warnings - bundle size is within limits');
  }

  console.log('\n' + '='.repeat(60));
}

function saveReport(stats: BundleStats) {
  const reportPath = path.join(process.cwd(), 'bundle-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

// Main
const stats = analyzeBundle();
printReport(stats);
saveReport(stats);
