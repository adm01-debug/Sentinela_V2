import type { Meta, StoryObj } from '@storybook/react';
import { TableEmpty } from './TableEmpty';
const meta: Meta<typeof TableEmpty> = { title: 'Components/TableEmpty', component: TableEmpty };
export default meta;
type Story = StoryObj<typeof TableEmpty>;
export const Default: Story = {};
