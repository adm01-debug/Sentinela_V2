import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';
const meta: Meta<typeof UserCard> = { title: 'Components/UserCard', component: UserCard };
export default meta;
type Story = StoryObj<typeof UserCard>;
export const Default: Story = {};
