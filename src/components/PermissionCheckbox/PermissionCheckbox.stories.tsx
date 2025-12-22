import type { Meta, StoryObj } from '@storybook/react';
import { PermissionCheckbox } from './PermissionCheckbox';
const meta: Meta<typeof PermissionCheckbox> = { title: 'Components/PermissionCheckbox', component: PermissionCheckbox };
export default meta;
type Story = StoryObj<typeof PermissionCheckbox>;
export const Default: Story = {};
