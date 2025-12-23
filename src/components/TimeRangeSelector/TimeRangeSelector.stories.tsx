import type { Meta, StoryObj } from '@storybook/react';
import { TimeRangeSelector } from './TimeRangeSelector';

const meta: Meta<typeof TimeRangeSelector> = {
  title: 'Components/TimeRangeSelector',
  component: TimeRangeSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimeRangeSelector>;

export const Default: Story = {};
