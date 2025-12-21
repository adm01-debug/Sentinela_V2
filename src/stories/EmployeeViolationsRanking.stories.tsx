import type { Meta, StoryObj } from '@storybook/react';
import { EmployeeViolationsRanking } from '@/components/EmployeeViolationsRanking';

const meta: Meta<typeof EmployeeViolationsRanking> = {
  title: 'Components/EmployeeViolationsRanking',
  component: EmployeeViolationsRanking,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof EmployeeViolationsRanking>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
