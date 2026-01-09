import type { Meta, StoryObj } from '@storybook/react';
import { Empty } from './Empty';
import { Button } from '../Button/Button';

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithDescription: Story = { args: { description: 'No data available' } };
export const WithAction: Story = {
  args: { description: 'No items yet', action: <Button>Add Item</Button> },
};
export const CustomImage: Story = { args: { image: '📭', description: 'Inbox empty' } };
export const NoResults: Story = { args: { image: '🔍', description: 'No results found', action: <Button variant="outline">Clear filters</Button> } };
