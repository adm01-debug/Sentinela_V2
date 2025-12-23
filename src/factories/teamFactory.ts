import { faker } from '@faker-js/faker/locale/pt_BR';
import { Team } from '@/types';

export const createTeam = (overrides?: Partial<Team>): Team => ({
  id: faker.string.uuid(),
  name: faker.company.name() + ' Team',
  description: faker.lorem.sentence(),
  leaderId: faker.string.uuid(),
  memberCount: faker.number.int({ min: 3, max: 20 }),
  createdAt: faker.date.past(),
  ...overrides,
});

export const createTeams = (count: number, overrides?: Partial<Team>): Team[] =>
  Array.from({ length: count }, () => createTeam(overrides));
