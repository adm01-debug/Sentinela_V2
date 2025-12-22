import type { Meta, StoryObj } from '@storybook/react';
import { PermissionMatrix } from './PermissionMatrix';

const meta: Meta<typeof PermissionMatrix> = {
  title: 'Components/PermissionMatrix',
  component: PermissionMatrix,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PermissionMatrix>;

export const Default: Story = {};
