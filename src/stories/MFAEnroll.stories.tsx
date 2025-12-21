import type { Meta, StoryObj } from '@storybook/react';
import { MFAEnroll } from '@/components/MFAEnroll';

const meta: Meta<typeof MFAEnroll> = {
  title: 'Components/MFAEnroll',
  component: MFAEnroll,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof MFAEnroll>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
