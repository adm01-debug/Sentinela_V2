import type { Screenshot } from '@/types';

export const mockScreenshots: Screenshot[] = [
  { id: '1', employeeId: '1', url: 'https://via.placeholder.com/1920x1080', thumbnailUrl: 'https://via.placeholder.com/320x180', application: 'VS Code', title: 'Código', capturedAt: new Date() },
  { id: '2', employeeId: '1', url: 'https://via.placeholder.com/1920x1080', thumbnailUrl: 'https://via.placeholder.com/320x180', application: 'Chrome', title: 'Navegador', capturedAt: new Date() },
  { id: '3', employeeId: '2', url: 'https://via.placeholder.com/1920x1080', thumbnailUrl: 'https://via.placeholder.com/320x180', application: 'Excel', title: 'Planilha', capturedAt: new Date() },
];
