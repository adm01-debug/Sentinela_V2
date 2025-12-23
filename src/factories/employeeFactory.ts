import { faker } from '@faker-js/faker/locale/pt_BR';
import { Employee } from '@/types';

export const createEmployee = (overrides?: Partial<Employee>): Employee => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  department: faker.helpers.arrayElement(['TI', 'RH', 'Financeiro', 'Comercial']),
  position: faker.person.jobTitle(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
  teamId: faker.string.uuid(),
  startDate: faker.date.past(),
  ...overrides,
});

export const createEmployees = (count: number, overrides?: Partial<Employee>): Employee[] =>
  Array.from({ length: count }, () => createEmployee(overrides));
