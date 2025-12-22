import { faker } from '@faker-js/faker';

export const userFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: 'employee',
  ...overrides,
});

export const employeeFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  department: faker.commerce.department(),
  position: faker.person.jobTitle(),
  status: 'active',
  ...overrides,
});

export const teamFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  description: faker.lorem.sentence(),
  memberCount: faker.number.int({ min: 1, max: 20 }),
  ...overrides,
});
