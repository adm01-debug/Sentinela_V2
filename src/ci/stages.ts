export const ciStages = {
  checkout: { name: 'checkout', script: 'git checkout $BRANCH' },
  install: { name: 'install', script: 'npm ci' },
  lint: { name: 'lint', script: 'npm run lint' },
  test: { name: 'test', script: 'npm test' },
  build: { name: 'build', script: 'npm run build' },
  deploy: { name: 'deploy', script: 'npm run deploy' },
  notify: { name: 'notify', script: 'curl -X POST $WEBHOOK_URL' },
};
export type StageName = keyof typeof ciStages;
export function getStage(name: StageName) { return ciStages[name]; }
export function getAllStages() { return Object.values(ciStages); }
