import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
const meta: Meta<typeof PageHeader> = { title: 'Components/PageHeader', component: PageHeader };
export default meta;
type Story = StoryObj<typeof PageHeader>;
export const Default: Story = {};
