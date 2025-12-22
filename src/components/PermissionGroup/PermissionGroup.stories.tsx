import type { Meta, StoryObj } from '@storybook/react';
import { PermissionGroup } from './PermissionGroup';
const meta: Meta<typeof PermissionGroup> = { title: 'Components/PermissionGroup', component: PermissionGroup };
export default meta;
type Story = StoryObj<typeof PermissionGroup>;
export const Default: Story = {};
