import { faker } from '@faker-js/faker/locale/pt_BR';
import { Violation } from '@/types';

export const createViolation = (overrides?: Partial<Violation>): Violation => ({
  id: faker.string.uuid(),
  employeeId: faker.string.uuid(),
  type: faker.helpers.arrayElement(['blocked_site', 'idle_time', 'off_hours']),
  severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
  description: faker.lorem.sentence(),
  detectedAt: faker.date.recent(),
  status: faker.helpers.arrayElement(['pending', 'acknowledged', 'resolved']),
  ...overrides,
});

export const createViolations = (count: number, overrides?: Partial<Violation>): Violation[] =>
  Array.from({ length: count }, () => createViolation(overrides));
