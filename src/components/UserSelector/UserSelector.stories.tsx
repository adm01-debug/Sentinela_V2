import type { Meta, StoryObj } from '@storybook/react';
import { UserSelector } from './UserSelector';
const meta: Meta<typeof UserSelector> = { title: 'Components/UserSelector', component: UserSelector };
export default meta;
type Story = StoryObj<typeof UserSelector>;
export const Default: Story = {};
