import { CIConfig } from './ciConfig';
export class GitHubActionsGenerator {
  generate(config: CIConfig): string { let yaml = 'name: ' + config.name + '\n\n'; yaml += 'on:\n'; config.triggers.forEach(t => { if (t === 'push' || t === 'pull_request') { yaml += '  ' + t + ':\n    branches: [' + config.branches.join(', ') + ']\n'; } }); yaml += '\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n'; yaml += '      - uses: actions/checkout@v4\n'; yaml += '      - uses: actions/setup-node@v4\n        with:\n          node-version: ' + config.nodeVersion + '\n'; yaml += '      - run: npm ci\n'; yaml += '      - run: npm run lint\n'; yaml += '      - run: npm test\n'; yaml += '      - run: npm run build\n'; return yaml; }
}
export const githubActionsGenerator = new GitHubActionsGenerator();
