/**
 * Semantic Release Configuration
 * Automates versioning and changelog generation
 */
module.exports = {
  branches: [
    'main',
    { name: 'develop', prerelease: 'beta' },
    { name: 'staging', prerelease: 'rc' },
  ],
  plugins: [
    // Analyze commits using conventional commits
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'docs', release: false },
          { type: 'style', release: false },
          { type: 'refactor', release: 'patch' },
          { type: 'test', release: false },
          { type: 'build', release: false },
          { type: 'ci', release: false },
          { type: 'chore', release: false },
          { breaking: true, release: 'major' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],
    
    // Generate release notes
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '🚀 Features', hidden: false },
            { type: 'fix', section: '🐛 Bug Fixes', hidden: false },
            { type: 'perf', section: '⚡ Performance', hidden: false },
            { type: 'revert', section: '⏪ Reverts', hidden: false },
            { type: 'docs', section: '📚 Documentation', hidden: true },
            { type: 'style', section: '💄 Styles', hidden: true },
            { type: 'refactor', section: '♻️ Refactoring', hidden: false },
            { type: 'test', section: '✅ Tests', hidden: true },
            { type: 'build', section: '📦 Build', hidden: true },
            { type: 'ci', section: '🔧 CI', hidden: true },
            { type: 'chore', section: '🔨 Chores', hidden: true },
          ],
        },
      },
    ],
    
    // Update CHANGELOG.md
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog\n\nAll notable changes to Sentinela will be documented in this file.',
      },
    ],
    
    // Update package.json version
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    
    // Commit the changes
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    
    // Create GitHub release
    [
      '@semantic-release/github',
      {
        assets: [],
        successComment: '🎉 This issue has been resolved in version ${nextRelease.version}',
        failComment: false,
        labels: ['released'],
      },
    ],
  ],
};
