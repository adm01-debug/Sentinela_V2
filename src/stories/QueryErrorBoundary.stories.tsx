import type { Meta, StoryObj } from '@storybook/react';
import { QueryErrorBoundary } from '@/components/QueryErrorBoundary';

const meta: Meta<typeof QueryErrorBoundary> = {
  title: 'Components/QueryErrorBoundary',
  component: QueryErrorBoundary,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof QueryErrorBoundary>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
