// LIB BARREL EXPORT - SENTINELA v20
// Core modules
export * from './api';
export * from './cache';
export * from './websocket';
export * from './validation';
export * from './i18n';
export * from './error-handling';

// Feature modules
export * from './feature-flags';
export * from './permissions';
// a11y and analytics have conflicts - import directly from submodules
// export * from './a11y';
// export * from './analytics';
export * from './monitoring';
// export * from './performance';

// Utility modules
export * from './pwa';
export * from './security';
export * from './seo';
export * from './utils';
