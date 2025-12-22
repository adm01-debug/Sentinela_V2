const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: 'node18',
  minify: true,
}).catch(() => process.exit(1));