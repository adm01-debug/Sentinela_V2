import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeStats } from './EmployeeStats';

const meta: Meta<typeof EmployeeStats> = { title: 'Components/EmployeeStats', component: EmployeeStats, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof EmployeeStats>;
export const Default: Story = {};
