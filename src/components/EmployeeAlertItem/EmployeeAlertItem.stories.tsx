import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeAlertItem } from './EmployeeAlertItem';

const meta: Meta<typeof EmployeeAlertItem> = { title: 'Components/EmployeeAlertItem', component: EmployeeAlertItem, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof EmployeeAlertItem>;
export const Default: Story = {};
