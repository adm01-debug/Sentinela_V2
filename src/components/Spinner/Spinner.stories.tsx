import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const Primary: Story = { args: { color: 'primary' } };
export const Secondary: Story = { args: { color: 'secondary' } };
export const White: Story = { args: { color: 'white' }, parameters: { backgrounds: { default: 'dark' } } };
export const WithLabel: Story = { args: { label: 'Loading...' } };
