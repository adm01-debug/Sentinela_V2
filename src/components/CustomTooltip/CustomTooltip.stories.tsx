import type { Meta, StoryObj } from '@storybook/react';
import { CustomTooltip } from './CustomTooltip';

const meta: Meta<typeof CustomTooltip> = {
  title: 'Components/CustomTooltip',
  component: CustomTooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CustomTooltip>;

export const Default: Story = {};
