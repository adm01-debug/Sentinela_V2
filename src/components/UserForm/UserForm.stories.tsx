import type { Meta, StoryObj } from '@storybook/react';
import { UserForm } from './UserForm';
const meta: Meta<typeof UserForm> = { title: 'Components/UserForm', component: UserForm };
export default meta;
type Story = StoryObj<typeof UserForm>;
export const Default: Story = {};
