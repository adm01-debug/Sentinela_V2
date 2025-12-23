import type { Meta, StoryObj } from '@storybook/react';
import { ReportScheduleDialog } from './ReportScheduleDialog';

const meta: Meta<typeof ReportScheduleDialog> = {
  title: 'Components/ReportScheduleDialog',
  component: ReportScheduleDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportScheduleDialog>;

export const Default: Story = {};
