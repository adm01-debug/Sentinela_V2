import type { Meta, StoryObj } from '@storybook/react';
import { SecurityPanel } from './SecurityPanel';

const meta: Meta<typeof SecurityPanel> = {
  title: 'Components/SecurityPanel',
  component: SecurityPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SecurityPanel>;

export const Default: Story = {};
