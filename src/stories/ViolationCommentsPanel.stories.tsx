import type { Meta, StoryObj } from '@storybook/react';
import { ViolationCommentsPanel } from '@/components/ViolationCommentsPanel';

const meta: Meta<typeof ViolationCommentsPanel> = {
  title: 'Components/ViolationCommentsPanel',
  component: ViolationCommentsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViolationCommentsPanel>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
