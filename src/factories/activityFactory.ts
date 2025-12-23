import { faker } from '@faker-js/faker/locale/pt_BR';
import { Activity } from '@/types';

export const createActivity = (overrides?: Partial<Activity>): Activity => ({
  id: faker.string.uuid(),
  employeeId: faker.string.uuid(),
  type: faker.helpers.arrayElement(['app', 'browser', 'idle']),
  application: faker.helpers.arrayElement(['Chrome', 'VS Code', 'Slack', 'Zoom', 'Excel']),
  title: faker.lorem.words(4),
  duration: faker.number.int({ min: 60, max: 3600 }),
  startTime: faker.date.recent(),
  endTime: faker.date.recent(),
  isProductive: faker.datatype.boolean(),
  ...overrides,
});

export const createActivities = (count: number, overrides?: Partial<Activity>): Activity[] =>
  Array.from({ length: count }, () => createActivity(overrides));
