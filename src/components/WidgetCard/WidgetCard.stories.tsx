import type { Meta, StoryObj } from '@storybook/react';
import { WidgetCard } from './WidgetCard';

const meta: Meta<typeof WidgetCard> = {
  title: 'Components/WidgetCard',
  component: WidgetCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WidgetCard>;

export const Default: Story = {};
