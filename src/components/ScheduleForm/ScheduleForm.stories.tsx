import type { Meta, StoryObj } from '@storybook/react';
import { ScheduleForm } from './ScheduleForm';

const meta: Meta<typeof ScheduleForm> = {
  title: 'Components/ScheduleForm',
  component: ScheduleForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScheduleForm>;

export const Default: Story = {};
