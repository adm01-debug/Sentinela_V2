import type { Meta, StoryObj } from '@storybook/react';
import { OrganizationStats } from './OrganizationStats';

const meta: Meta<typeof OrganizationStats> = {
  title: 'Components/OrganizationStats',
  component: OrganizationStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OrganizationStats>;

export const Default: Story = {};
