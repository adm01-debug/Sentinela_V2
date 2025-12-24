import { ConsentPurpose } from './consentManager';
export interface ConsentUIConfig { title: string; description: string; purposes: { purpose: ConsentPurpose; label: string; description: string; required?: boolean }[]; }
export const defaultConsentUIConfig: ConsentUIConfig = { title: 'Preferências de Privacidade', description: 'Escolha como usamos seus dados', purposes: [ { purpose: 'analytics', label: 'Analytics', description: 'Análise de uso' }, { purpose: 'marketing', label: 'Marketing', description: 'Comunicações promocionais' }, { purpose: 'personalization', label: 'Personalização', description: 'Experiência personalizada' }, { purpose: 'thirdParty', label: 'Terceiros', description: 'Compartilhamento com parceiros' } ] };
export class ConsentUI {
  private config: ConsentUIConfig = defaultConsentUIConfig;
  setConfig(config: ConsentUIConfig): void { this.config = config; }
  getConfig(): ConsentUIConfig { return this.config; }
}
export const consentUI = new ConsentUI();
