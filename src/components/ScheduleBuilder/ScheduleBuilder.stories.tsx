import type { Meta, StoryObj } from '@storybook/react';
import { ScheduleBuilder } from './ScheduleBuilder';
const meta: Meta<typeof ScheduleBuilder> = { title: 'Components/ScheduleBuilder', component: ScheduleBuilder };
export default meta;
type Story = StoryObj<typeof ScheduleBuilder>;
export const Default: Story = {};
