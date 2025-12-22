import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'employee',
  ...overrides,
});

export const createEmployee = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  department: faker.commerce.department(),
  position: faker.person.jobTitle(),
  ...overrides,
});

export const createTeam = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  description: faker.lorem.sentence(),
  ...overrides,
});