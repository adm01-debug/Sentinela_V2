import type { Meta, StoryObj } from '@storybook/react';
import { MFASettings } from '@/components/MFASettings';

const meta: Meta<typeof MFASettings> = {
  title: 'Components/MFASettings',
  component: MFASettings,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof MFASettings>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
