import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Team } from '@/types';

export function createTeam(overrides?: Partial<Team>): Team {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.department() + ' Team',
    description: faker.lorem.sentence(),
    leaderId: faker.string.uuid(),
    memberCount: faker.number.int({ min: 3, max: 20 }),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

export function createTeams(count: number, overrides?: Partial<Team>): Team[] {
  return Array.from({ length: count }, () => createTeam(overrides));
}
