/**
 * Lint-staged Configuration
 * Runs linters on staged files before commit
 */
module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
  ],
  
  // CSS and SCSS files
  '*.{css,scss}': [
    'prettier --write',
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
  ],
  
  // HTML files
  '*.html': [
    'prettier --write',
  ],
  
  // Package.json - sort dependencies
  'package.json': [
    'prettier --write',
  ],
};
