#!/usr/bin/env ts-node
/**
 * Translation Sync Script
 * Synchronizes translation files across locales
 */

import * as fs from "fs";
import * as path from "path";

const LOCALES = ["en", "pt", "es"];
const BASE_LOCALE = "en";

interface TranslationFile {
  [key: string]: string | TranslationFile;
}

function getKeys(obj: TranslationFile, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object") {
      keys.push(...getKeys(obj[key] as TranslationFile, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function main() {
  console.log("🌐 Syncing translations...\n");
  
  const localesDir = path.join(__dirname, "../src/locales");
  const baseFile = JSON.parse(
    fs.readFileSync(path.join(localesDir, `${BASE_LOCALE}.json`), "utf8")
  );
  const baseKeys = getKeys(baseFile);
  
  for (const locale of LOCALES) {
    if (locale === BASE_LOCALE) continue;
    
    const localePath = path.join(localesDir, `${locale}.json`);
    const localeFile = JSON.parse(fs.readFileSync(localePath, "utf8"));
    const localeKeys = getKeys(localeFile);
    
    const missing = baseKeys.filter(k => !localeKeys.includes(k));
    const extra = localeKeys.filter(k => !baseKeys.includes(k));
    
    console.log(`📄 ${locale}.json`);
    console.log(`   Missing: ${missing.length}`);
    console.log(`   Extra: ${extra.length}`);
    
    if (missing.length > 0) {
      console.log(`   ⚠️ Missing keys: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "..." : ""}`);
    }
  }
  
  console.log("\n✅ Translation sync complete!");
}

main();
