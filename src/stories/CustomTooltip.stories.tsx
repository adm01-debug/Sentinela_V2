import type { Meta, StoryObj } from '@storybook/react';

import { CustomTooltip } from '@/components/CustomTooltip';

const meta: Meta<typeof CustomTooltip> = {
  title: 'Components/CustomTooltip',
  component: CustomTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CustomTooltip>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
