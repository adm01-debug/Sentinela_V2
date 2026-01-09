import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithText: Story = { args: { children: 'OR' } };
export const Vertical: Story = { args: { orientation: 'vertical' }, decorators: [(Story) => <div style={{ height: 50, display: 'flex' }}><Story /></div>] };
export const Dashed: Story = { args: { variant: 'dashed' } };
export const Dotted: Story = { args: { variant: 'dotted' } };
