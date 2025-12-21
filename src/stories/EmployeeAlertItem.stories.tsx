import type { Meta, StoryObj } from '@storybook/react';

import { EmployeeAlertItem } from '@/components/EmployeeAlertItem';

const meta: Meta<typeof EmployeeAlertItem> = {
  title: 'Components/EmployeeAlertItem',
  component: EmployeeAlertItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeAlertItem>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
