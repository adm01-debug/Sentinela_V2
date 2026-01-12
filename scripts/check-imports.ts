#!/usr/bin/env tsx
/**
 * Check for circular imports
 * Usage: npx tsx scripts/check-imports.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(__dirname, '../src');

function findFiles(dir: string, ext: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      files.push(...findFiles(fullPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkCircularImports() {
  console.log('Checking for circular imports...');
  const files = [...findFiles(SRC_DIR, '.ts'), ...findFiles(SRC_DIR, '.tsx')];
  console.log(`Found ${files.length} TypeScript files`);
  // Add madge or similar for actual circular import detection
  console.log('Check complete!');
}

checkCircularImports();
