import type { Meta, StoryObj } from '@storybook/react';
import { MonitoringNotice } from '@/components/MonitoringNotice';

const meta: Meta<typeof MonitoringNotice> = {
  title: 'Components/MonitoringNotice',
  component: MonitoringNotice,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof MonitoringNotice>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
