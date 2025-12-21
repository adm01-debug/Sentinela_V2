import type { Meta, StoryObj } from '@storybook/react';
import { MFAVerify } from '@/components/MFAVerify';

const meta: Meta<typeof MFAVerify> = {
  title: 'Components/MFAVerify',
  component: MFAVerify,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof MFAVerify>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
