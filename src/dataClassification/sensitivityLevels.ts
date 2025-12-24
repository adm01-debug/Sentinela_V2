import { ClassificationLevel } from './classifier';
export interface SensitivityConfig { level: ClassificationLevel; description: string; color: string; accessRestrictions: string[]; handlingInstructions: string[]; }
export const sensitivityLevels: Record<ClassificationLevel, SensitivityConfig> = {
  public: { level: 'public', description: 'Dados públicos', color: '#28a745', accessRestrictions: [], handlingInstructions: ['Pode ser compartilhado livremente'] },
  internal: { level: 'internal', description: 'Uso interno', color: '#17a2b8', accessRestrictions: ['Apenas funcionários'], handlingInstructions: ['Não compartilhar externamente'] },
  confidential: { level: 'confidential', description: 'Confidencial', color: '#ffc107', accessRestrictions: ['Need-to-know basis'], handlingInstructions: ['Criptografar em trânsito', 'Não imprimir'] },
  restricted: { level: 'restricted', description: 'Restrito', color: '#fd7e14', accessRestrictions: ['Aprovação gerencial'], handlingInstructions: ['Criptografar sempre', 'Registrar acessos'] },
  top_secret: { level: 'top_secret', description: 'Ultra secreto', color: '#dc3545', accessRestrictions: ['Clearance especial'], handlingInstructions: ['Ambiente isolado', 'Auditoria completa'] }
};
export function getSensitivityConfig(level: ClassificationLevel): SensitivityConfig { return sensitivityLevels[level]; }
