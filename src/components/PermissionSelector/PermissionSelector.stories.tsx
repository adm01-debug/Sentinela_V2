import type { Meta, StoryObj } from '@storybook/react';
import { PermissionSelector } from './PermissionSelector';

const meta: Meta<typeof PermissionSelector> = {
  title: 'Components/PermissionSelector',
  component: PermissionSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PermissionSelector>;

export const Default: Story = {};
