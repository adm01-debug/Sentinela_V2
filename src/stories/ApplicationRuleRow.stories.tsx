import type { Meta, StoryObj } from '@storybook/react';

import { ApplicationRuleRow } from '@/components/ApplicationRuleRow';

const meta: Meta<typeof ApplicationRuleRow> = {
  title: 'Components/ApplicationRuleRow',
  component: ApplicationRuleRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationRuleRow>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
