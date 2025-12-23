import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Employee } from '@/types';

export function createEmployee(overrides?: Partial<Employee>): Employee {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    department: faker.commerce.department(),
    position: faker.person.jobTitle(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    teamId: faker.string.uuid(),
    hiredAt: faker.date.past({ years: 5 }),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

export function createEmployees(count: number, overrides?: Partial<Employee>): Employee[] {
  return Array.from({ length: count }, () => createEmployee(overrides));
}
