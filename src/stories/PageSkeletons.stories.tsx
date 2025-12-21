import type { Meta, StoryObj } from '@storybook/react';
import { PageSkeletons } from '@/components/PageSkeletons';

const meta: Meta<typeof PageSkeletons> = {
  title: 'Components/PageSkeletons',
  component: PageSkeletons,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PageSkeletons>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
