#!/usr/bin/env ts-node
/**
 * Changelog Generator
 * Generates changelog from git commits
 */

import { execSync } from "child_process";

interface CommitGroup {
  type: string;
  emoji: string;
  commits: string[];
}

const commitTypes: Record<string, { emoji: string; title: string }> = {
  feat: { emoji: "✨", title: "Features" },
  fix: { emoji: "🐛", title: "Bug Fixes" },
  docs: { emoji: "📚", title: "Documentation" },
  style: { emoji: "💅", title: "Styling" },
  refactor: { emoji: "♻️", title: "Refactoring" },
  perf: { emoji: "⚡", title: "Performance" },
  test: { emoji: "🧪", title: "Tests" },
  chore: { emoji: "🔧", title: "Chores" },
};

function main() {
  const lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null || echo ''", { encoding: "utf8" }).trim();
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD~50..HEAD";
  
  const commits = execSync(`git log ${range} --pretty=format:"%s" 2>/dev/null`, { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  
  const groups: Record<string, string[]> = {};
  
  for (const commit of commits) {
    const match = commit.match(/^(\w+)(\(.+?\))?:\s*(.+)$/);
    if (match) {
      const [, type, , message] = match;
      if (!groups[type]) groups[type] = [];
      groups[type].push(message);
    }
  }
  
  console.log(`# Changelog\n`);
  console.log(`## [Unreleased]\n`);
  
  for (const [type, config] of Object.entries(commitTypes)) {
    if (groups[type]?.length) {
      console.log(`### ${config.emoji} ${config.title}\n`);
      for (const msg of groups[type]) {
        console.log(`- ${msg}`);
      }
      console.log("");
    }
  }
}

main();
