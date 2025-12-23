import type { Meta, StoryObj } from '@storybook/react';
import { RoleSelector } from './RoleSelector';

const meta: Meta<typeof RoleSelector> = {
  title: 'Components/RoleSelector',
  component: RoleSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RoleSelector>;

export const Default: Story = {};
