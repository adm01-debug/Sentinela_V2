import type { Meta, StoryObj } from '@storybook/react';
import { KeystrokeActivityCard } from '@/components/KeystrokeActivityCard';

const meta: Meta<typeof KeystrokeActivityCard> = {
  title: 'Components/KeystrokeActivityCard',
  component: KeystrokeActivityCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof KeystrokeActivityCard>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
