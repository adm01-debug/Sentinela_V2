import type { Meta, StoryObj } from '@storybook/react';
import { ScheduleCard } from './ScheduleCard';
const meta: Meta<typeof ScheduleCard> = { title: 'Components/ScheduleCard', component: ScheduleCard };
export default meta;
type Story = StoryObj<typeof ScheduleCard>;
export const Default: Story = {};
