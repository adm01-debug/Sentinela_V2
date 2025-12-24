export class SemVer {
  major: number; minor: number; patch: number; prerelease?: string;
  constructor(version: string) { const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/); if (!match) throw new Error('Invalid version'); [, this.major, this.minor, this.patch] = match.map(Number) as [any, number, number, number]; this.prerelease = match[4]; }
  bumpMajor(): string { return (this.major + 1) + '.0.0'; }
  bumpMinor(): string { return this.major + '.' + (this.minor + 1) + '.0'; }
  bumpPatch(): string { return this.major + '.' + this.minor + '.' + (this.patch + 1); }
  toString(): string { return this.major + '.' + this.minor + '.' + this.patch + (this.prerelease ? '-' + this.prerelease : ''); }
  compare(other: SemVer): number { if (this.major !== other.major) return this.major - other.major; if (this.minor !== other.minor) return this.minor - other.minor; return this.patch - other.patch; }
}
export const parseSemVer = (v: string) => new SemVer(v);
