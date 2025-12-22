import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeRow } from './EmployeeRow';

const meta: Meta<typeof EmployeeRow> = { title: 'Components/EmployeeRow', component: EmployeeRow, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof EmployeeRow>;
export const Default: Story = {};
