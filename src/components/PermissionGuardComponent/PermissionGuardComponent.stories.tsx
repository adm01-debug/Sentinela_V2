import type { Meta, StoryObj } from '@storybook/react';
import { PermissionGuardComponent } from './PermissionGuardComponent';

const meta: Meta<typeof PermissionGuardComponent> = {
  title: 'Components/PermissionGuardComponent',
  component: PermissionGuardComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PermissionGuardComponent>;

export const Default: Story = {};
