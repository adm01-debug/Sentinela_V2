import { Migration } from './types';

export class MigrationGenerator {
  generate(name: string): MigrationTemplate {
    const timestamp = Date.now();
    const id = timestamp + '_' + name.toLowerCase().replace(/\s+/g, '_');
    
    return {
      id,
      name,
      timestamp,
      content: this.generateContent(id, name)
    };
  }
  
  private generateContent(id: string, name: string): string {
    return 'import { Migration } from "./types";\n\nexport const migration: Migration = {\n  id: "' + id + '",\n  name: "' + name + '",\n  timestamp: ' + Date.now() + ',\n  async up() {\n    // Migration logic here\n  },\n  async down() {\n    // Rollback logic here\n  }\n};';
  }
}

export interface MigrationTemplate { id: string; name: string; timestamp: number; content: string; }