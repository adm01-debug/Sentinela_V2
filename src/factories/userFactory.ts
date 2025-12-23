import { faker } from '@faker-js/faker/locale/pt_BR';
import { User } from '@/types';

export const createUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: faker.helpers.arrayElement(['admin', 'manager', 'user']),
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createUsers = (count: number, overrides?: Partial<User>): User[] =>
  Array.from({ length: count }, () => createUser(overrides));
