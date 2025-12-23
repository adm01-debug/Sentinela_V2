import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Violation } from '@/types';

export function createViolation(overrides?: Partial<Violation>): Violation {
  return {
    id: faker.string.uuid(),
    employeeId: faker.string.uuid(),
    type: faker.helpers.arrayElement(['productivity', 'security', 'policy', 'time']),
    severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['pending', 'acknowledged', 'resolved', 'dismissed']),
    detectedAt: faker.date.recent(),
    resolvedAt: faker.datatype.boolean() ? faker.date.recent() : undefined,
    ...overrides,
  };
}

export function createViolations(count: number, overrides?: Partial<Violation>): Violation[] {
  return Array.from({ length: count }, () => createViolation(overrides));
}
