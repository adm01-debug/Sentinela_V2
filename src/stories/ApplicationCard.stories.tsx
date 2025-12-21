import type { Meta, StoryObj } from '@storybook/react';

import { ApplicationCard } from '@/components/ApplicationCard';

const meta: Meta<typeof ApplicationCard> = {
  title: 'Components/ApplicationCard',
  component: ApplicationCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
