import type { Meta, StoryObj } from '@storybook/react';
import { MonitoringPolicyCard } from './MonitoringPolicyCard';

const meta: Meta<typeof MonitoringPolicyCard> = {
  title: 'Components/MonitoringPolicyCard',
  component: MonitoringPolicyCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MonitoringPolicyCard>;

export const Default: Story = {};
