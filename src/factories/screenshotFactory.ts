import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Screenshot } from '@/types';

export function createScreenshot(overrides?: Partial<Screenshot>): Screenshot {
  return {
    id: faker.string.uuid(),
    employeeId: faker.string.uuid(),
    url: faker.image.url(),
    thumbnailUrl: faker.image.url(),
    application: faker.helpers.arrayElement(['VS Code', 'Chrome', 'Slack', 'Zoom']),
    title: faker.lorem.words(4),
    capturedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createScreenshots(count: number, overrides?: Partial<Screenshot>): Screenshot[] {
  return Array.from({ length: count }, () => createScreenshot(overrides));
}
