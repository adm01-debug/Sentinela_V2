import type { Meta, StoryObj } from '@storybook/react';
import { RoleList } from './RoleList';
const meta: Meta<typeof RoleList> = { title: 'Components/RoleList', component: RoleList };
export default meta;
type Story = StoryObj<typeof RoleList>;
export const Default: Story = {};
