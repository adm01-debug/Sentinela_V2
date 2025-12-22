import type { Meta, StoryObj } from '@storybook/react';
import { PermissionBadge } from './PermissionBadge';
const meta: Meta<typeof PermissionBadge> = { title: 'Components/PermissionBadge', component: PermissionBadge };
export default meta;
type Story = StoryObj<typeof PermissionBadge>;
export const Default: Story = {};
