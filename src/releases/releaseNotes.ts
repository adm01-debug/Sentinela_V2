export interface ReleaseNote { type: 'feature' | 'fix' | 'breaking' | 'docs' | 'chore'; description: string; issue?: string; }
export class ReleaseNotesGenerator {
  private notes: ReleaseNote[] = [];
  add(note: ReleaseNote): void { this.notes.push(note); }
  generate(): string { let md = '# Release Notes\n\n'; const groups = { breaking: 'Breaking Changes', feature: 'Features', fix: 'Bug Fixes', docs: 'Documentation', chore: 'Chores' }; for (const [type, title] of Object.entries(groups)) { const items = this.notes.filter(n => n.type === type); if (items.length) { md += '## ' + title + '\n\n'; items.forEach(n => md += '- ' + n.description + (n.issue ? ' (#' + n.issue + ')' : '') + '\n'); md += '\n'; } } return md; }
  clear(): void { this.notes = []; }
}
export const releaseNotesGenerator = new ReleaseNotesGenerator();
