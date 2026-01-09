import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Card content goes here' } };
export const WithHeader: Story = { args: { title: 'Card Title', children: 'Content with header' } };
export const WithFooter: Story = { args: { children: 'Content', footer: 'Footer content' } };
export const Hoverable: Story = { args: { children: 'Hover me', hoverable: true } };
export const Bordered: Story = { args: { children: 'Bordered card', bordered: true } };
export const Compact: Story = { args: { children: 'Compact padding', compact: true } };
export const WithImage: Story = { args: { image: 'https://picsum.photos/400/200', title: 'Image Card', children: 'Description' } };
