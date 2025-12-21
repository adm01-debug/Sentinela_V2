import type { Meta, StoryObj } from '@storybook/react';
import { SavedFiltersBar } from '@/components/SavedFiltersBar';

const meta: Meta<typeof SavedFiltersBar> = {
  title: 'Components/SavedFiltersBar',
  component: SavedFiltersBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SavedFiltersBar>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
