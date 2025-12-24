import { DockerConfig } from './dockerConfig';
export class DockerfileGenerator {
  generate(config: DockerConfig): string { let dockerfile = 'FROM node:20-alpine\n\n'; dockerfile += 'WORKDIR /app\n\n'; dockerfile += 'COPY package*.json ./\n'; dockerfile += 'RUN npm ci --only=production\n\n'; dockerfile += 'COPY . .\n\n'; dockerfile += 'RUN npm run build\n\n'; for (const [key, value] of Object.entries(config.env)) { dockerfile += 'ENV ' + key + '=' + value + '\n'; } dockerfile += '\nEXPOSE ' + config.ports.map(p => p.container).join(' ') + '\n'; dockerfile += '\nCMD ["npm", "start"]\n'; return dockerfile; }
  generateMultiStage(config: DockerConfig): string { let dockerfile = '# Build stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n'; dockerfile += '# Production stage\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY package*.json ./\nRUN npm ci --only=production\n'; dockerfile += 'CMD ["npm", "start"]\n'; return dockerfile; }
}
export const dockerfileGenerator = new DockerfileGenerator();
