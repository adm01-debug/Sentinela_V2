import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeRow } from '@/components/EmployeeRow';

const meta: Meta<typeof EmployeeRow> = {
  title: 'Components/EmployeeRow',
  component: EmployeeRow,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof EmployeeRow>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
