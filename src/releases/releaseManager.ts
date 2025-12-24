export interface Release { version: string; tag: string; date: Date; changelog: string; assets: string[]; draft: boolean; prerelease: boolean; }
export class ReleaseManager {
  private releases: Release[] = [];
  create(version: string, changelog: string, prerelease = false): Release { const release: Release = { version, tag: 'v' + version, date: new Date(), changelog, assets: [], draft: true, prerelease }; this.releases.push(release); return release; }
  publish(version: string): void { const release = this.releases.find(r => r.version === version); if (release) release.draft = false; }
  getLatest(): Release | null { return this.releases.filter(r => !r.draft && !r.prerelease).sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null; }
  getAll(): Release[] { return [...this.releases]; }
}
export const releaseManager = new ReleaseManager();
