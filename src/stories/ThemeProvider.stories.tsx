import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@/components/ThemeProvider';

const meta: Meta<typeof ThemeProvider> = {
  title: 'Components/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
