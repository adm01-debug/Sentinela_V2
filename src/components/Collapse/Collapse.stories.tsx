import type { Meta, StoryObj } from '@storybook/react';
import { Collapse } from './Collapse';

const meta: Meta<typeof Collapse> = {
  title: 'Components/Collapse',
  component: Collapse,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { isOpen: true, children: 'Collapsible content' } };
export const Closed: Story = { args: { isOpen: false, children: 'Hidden content' } };
export const WithAnimation: Story = { args: { isOpen: true, animated: true, children: 'Animated collapse' } };
