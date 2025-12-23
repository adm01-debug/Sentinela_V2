import type { Meta, StoryObj } from '@storybook/react';
import { RoleForm } from './RoleForm';

const meta: Meta<typeof RoleForm> = {
  title: 'Components/RoleForm',
  component: RoleForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RoleForm>;

export const Default: Story = {};
