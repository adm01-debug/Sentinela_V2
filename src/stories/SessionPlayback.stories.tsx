import type { Meta, StoryObj } from '@storybook/react';
import { SessionPlayback } from '@/components/SessionPlayback';

const meta: Meta<typeof SessionPlayback> = {
  title: 'Components/SessionPlayback',
  component: SessionPlayback,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SessionPlayback>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
