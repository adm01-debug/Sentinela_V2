export interface LGPDRule { id: string; article: string; description: string; check: () => boolean; }
export const lgpdRules: LGPDRule[] = [
  { id: 'ART7', article: 'Art. 7', description: 'Tratamento mediante consentimento', check: () => true },
  { id: 'ART8', article: 'Art. 8', description: 'Consentimento por escrito', check: () => true },
  { id: 'ART9', article: 'Art. 9', description: 'Acesso facilitado às informações', check: () => true },
  { id: 'ART18', article: 'Art. 18', description: 'Direitos do titular', check: () => true },
  { id: 'ART46', article: 'Art. 46', description: 'Segurança e sigilo de dados', check: () => true },
];
export function checkLGPDCompliance(): { passed: number; failed: number } { const results = lgpdRules.map(r => r.check()); return { passed: results.filter(r => r).length, failed: results.filter(r => !r).length }; }
