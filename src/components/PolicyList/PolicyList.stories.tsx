import type { Meta, StoryObj } from '@storybook/react';
import { PolicyList } from './PolicyList';
const meta: Meta<typeof PolicyList> = { title: 'Components/PolicyList', component: PolicyList };
export default meta;
type Story = StoryObj<typeof PolicyList>;
export const Default: Story = {};
