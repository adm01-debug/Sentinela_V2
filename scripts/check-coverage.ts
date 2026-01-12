#!/usr/bin/env node
/**
 * Check test coverage thresholds
 * Usage: npx ts-node scripts/check-coverage.ts
 */
import fs from 'fs';
import path from 'path';

const COVERAGE_FILE = path.join(__dirname, '../coverage/coverage-summary.json');
const THRESHOLDS = { lines: 80, branches: 70, functions: 80, statements: 80 };

function checkCoverage() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error('❌ Coverage file not found. Run tests first.');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf-8'));
  const total = coverage.total;
  let passed = true;

  Object.entries(THRESHOLDS).forEach(([key, threshold]) => {
    const actual = total[key]?.pct ?? 0;
    if (actual < threshold) {
      console.error(`❌ ${key}: ${actual}% < ${threshold}%`);
      passed = false;
    } else {
      console.log(`✅ ${key}: ${actual}% >= ${threshold}%`);
    }
  });

  process.exit(passed ? 0 : 1);
}

checkCoverage();
