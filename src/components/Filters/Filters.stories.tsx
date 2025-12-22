import type { Meta, StoryObj } from '@storybook/react';
import { Filters } from './Filters';

const meta: Meta<typeof Filters> = {
  title: 'Components/Filters',
  component: Filters,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Filters>;

export const Default: Story = {};
