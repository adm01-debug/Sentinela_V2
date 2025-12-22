import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeSelector } from './EmployeeSelector';

const meta: Meta<typeof EmployeeSelector> = { title: 'Components/EmployeeSelector', component: EmployeeSelector, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof EmployeeSelector>;
export const Default: Story = {};
