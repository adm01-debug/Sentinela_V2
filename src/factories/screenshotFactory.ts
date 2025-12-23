import { faker } from '@faker-js/faker/locale/pt_BR';
import { Screenshot } from '@/types';

export const createScreenshot = (overrides?: Partial<Screenshot>): Screenshot => ({
  id: faker.string.uuid(),
  employeeId: faker.string.uuid(),
  url: faker.image.url(),
  thumbnail: faker.image.url(),
  capturedAt: faker.date.recent(),
  application: faker.helpers.arrayElement(['Chrome', 'VS Code', 'Slack']),
  ...overrides,
});

export const createScreenshots = (count: number, overrides?: Partial<Screenshot>): Screenshot[] =>
  Array.from({ length: count }, () => createScreenshot(overrides));
