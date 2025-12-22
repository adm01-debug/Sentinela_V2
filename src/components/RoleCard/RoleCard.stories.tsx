import type { Meta, StoryObj } from '@storybook/react';
import { RoleCard } from './RoleCard';
const meta: Meta<typeof RoleCard> = { title: 'Components/RoleCard', component: RoleCard };
export default meta;
type Story = StoryObj<typeof RoleCard>;
export const Default: Story = {};
