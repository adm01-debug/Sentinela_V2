import type { Meta, StoryObj } from '@storybook/react';
import { TeamForm } from './TeamForm';
const meta: Meta<typeof TeamForm> = { title: 'Components/TeamForm', component: TeamForm };
export default meta;
type Story = StoryObj<typeof TeamForm>;
export const Default: Story = {};
