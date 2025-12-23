import type { Meta, StoryObj } from '@storybook/react';
import { RolePermissions } from './RolePermissions';

const meta: Meta<typeof RolePermissions> = {
  title: 'Components/RolePermissions',
  component: RolePermissions,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RolePermissions>;

export const Default: Story = {};
