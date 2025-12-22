import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeFilters } from './EmployeeFilters';

const meta: Meta<typeof EmployeeFilters> = { title: 'Components/EmployeeFilters', component: EmployeeFilters, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof EmployeeFilters>;
export const Default: Story = {};
