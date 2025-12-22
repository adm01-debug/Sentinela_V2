import type { Meta, StoryObj } from '@storybook/react';
import { MonitoringPolicyForm } from './MonitoringPolicyForm';

const meta: Meta<typeof MonitoringPolicyForm> = {
  title: 'Components/MonitoringPolicyForm',
  component: MonitoringPolicyForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MonitoringPolicyForm>;

export const Default: Story = {};
