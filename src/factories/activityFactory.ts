import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Activity } from '@/types';

export function createActivity(overrides?: Partial<Activity>): Activity {
  const startedAt = faker.date.recent();
  return {
    id: faker.string.uuid(),
    employeeId: faker.string.uuid(),
    type: faker.helpers.arrayElement(['app', 'website', 'idle', 'meeting']),
    application: faker.helpers.arrayElement(['VS Code', 'Chrome', 'Slack', 'Zoom', 'Excel']),
    title: faker.lorem.words(3),
    duration: faker.number.int({ min: 60, max: 7200 }),
    isProductive: faker.datatype.boolean(),
    startedAt,
    endedAt: faker.date.soon({ refDate: startedAt }),
    ...overrides,
  };
}

export function createActivities(count: number, overrides?: Partial<Activity>): Activity[] {
  return Array.from({ length: count }, () => createActivity(overrides));
}
